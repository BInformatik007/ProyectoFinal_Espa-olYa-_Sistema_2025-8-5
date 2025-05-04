import { supabase } from './supabaseClient.js';

const previewContainer = document.querySelector('.main-lessons-tests__preview-container');
const lessonContentContainer = document.querySelector('.main-lessons-tests__lesson-content-container');
const contentWrapper = document.querySelector('.main-lessons-test__lesson-content');
const nextBtn = lessonContentContainer.querySelectorAll('.main-lessons-tests__btn-nav')[1];
const backButton = lessonContentContainer.querySelector('.main-lessons-tests__btn-nav-back');
const btnSiguiente = document.getElementById('btn-siguiente');

let currentActivity = 0;
let activities = [];
let correctCount = 0;
let lessonId = null;
let userId = null;
let lessonDifficulty = '';
let totalPoints = 0;

// Paso 1: Obtener info inicial
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    lessonId = parseInt(urlParams.get('id'));
    if (!lessonId) return;

    const session = await supabase.auth.getSession();
    userId = session.data.session?.user.id;

    const { data: lessonData } = await supabase
        .from('lessons')
        .select('title, description, difficulty')
        .eq('id', lessonId)
        .single();

    document.querySelector('#lesson-title').textContent = lessonData.title;
    document.querySelector('#lesson-description').textContent = lessonData.description;
    lessonDifficulty = lessonData.difficulty;

    const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('activity_number', { ascending: true });

    activities = activitiesData;
});

// Paso 2: Mostrar actividades
btnSiguiente.addEventListener('click', () => {
    previewContainer.style.display = 'none';
    lessonContentContainer.style.display = 'block';
    showActivity();
});

backButton.addEventListener('click', () => {
    lessonContentContainer.style.display = 'none';
    previewContainer.style.display = 'block';
});

nextBtn.addEventListener('click', () => {
    currentActivity++;
    if (currentActivity < activities.length) {
        showActivity();
    } else {
        showSummary();
        updateProgress();
    }
    nextBtn.disabled = true;
    nextBtn.classList.add('first-back-btn');
});

function showActivity() {
    const activity = activities[currentActivity];
    contentWrapper.innerHTML = '';

    const box = document.createElement('div');
    box.className = 'activity-box';

    const question = document.createElement('p');
    question.textContent = `${currentActivity + 1}. ${activity.question}`;
    box.appendChild(question);

    if (activity.type === 'multiple_choice') {
        activity.options.forEach(option => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.className = 'option-btn';
            btn.addEventListener('click', () => {
                const correct = activity.correct_answer[0];
                const isCorrect = option === correct;
                if (isCorrect) correctCount += activity.points;
                showFeedback(box, isCorrect, activity.explanation, correct);
            });
            box.appendChild(btn);
        });
    }

    else if (activity.type === 'fill_in_blank') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = activity.hint || 'Escribe tu respuesta...';
        input.className = 'input-blank';
        box.appendChild(input);

        const checkBtn = document.createElement('button');
        checkBtn.textContent = 'Verificar';
        checkBtn.className = 'btn-check';
        checkBtn.addEventListener('click', () => {
            const isCorrect = input.value.trim().toLowerCase() === activity.correct_answer[0].toLowerCase();
            if (isCorrect) correctCount += activity.points;
            showFeedback(box, isCorrect, activity.explanation, activity.correct_answer[0]);
        });
        box.appendChild(checkBtn);
    }

    else if (activity.type === 'ordering') {
        const list = document.createElement('ul');
        list.className = 'ordering-list';

        let shuffled = [...activity.options].sort(() => Math.random() - 0.5);
        shuffled.forEach(text => {
            const li = document.createElement('li');
            li.className = 'ordering-item';
            li.textContent = text;
            li.draggable = true;
            list.appendChild(li);
        });

        enableOrderingDragDrop(list);

        box.appendChild(list);

        const checkBtn = document.createElement('button');
        checkBtn.textContent = 'Verificar';
        checkBtn.className = 'btn-check';
        checkBtn.addEventListener('click', () => {
            const userAnswer = Array.from(list.children).map(li => li.textContent);
            const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(activity.correct_answer);
            if (isCorrect) correctCount += activity.points;
            showFeedback(box, isCorrect, activity.explanation);
        });
        box.appendChild(checkBtn);
    }

    else {
        const msg = document.createElement('p');
        msg.textContent = `Tipo de actividad no soportado: ${activity.type}`;
        box.appendChild(msg);
    }

    contentWrapper.appendChild(box);
}

function enableOrderingDragDrop(list) {
    let dragItem = null;

    list.querySelectorAll('li').forEach(item => {
        item.addEventListener('dragstart', () => (dragItem = item));
        item.addEventListener('dragover', e => e.preventDefault());
        item.addEventListener('drop', () => {
            if (dragItem !== item) {
                list.insertBefore(dragItem, item);
            }
        });
    });
}

function showFeedback(container, isCorrect, explanation, correctAnswer = '') {
    const msg = document.createElement('p');
    msg.textContent = isCorrect ? '✅ ¡Correcto!' : `❌ Incorrecto. ${explanation || 'Respuesta: ' + correctAnswer}`;
    container.appendChild(msg);

    container.querySelectorAll('button').forEach(btn => btn.disabled = true);
    nextBtn.disabled = false;
    nextBtn.classList.remove('first-back-btn');
}

function showSummary() {
    contentWrapper.innerHTML = `
        <div class="summary-card">
            <h2>Lección completada</h2>
            <p>Obtuviste ${correctCount} puntos de un total posible de ${activities.reduce((sum, a) => sum + a.points, 0)}.</p>
            <p><a class="btn-return" href="../html/lessons.html">Volver a las lecciones</a></p>
        </div>
    `;
    nextBtn.style.display = 'none';
    backButton.style.display = 'none';
}

// Paso 3: Guardar progreso al completar
async function updateProgress() {
    if (!userId || !lessonId) return;

    const { data: existing } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

    const currentScore = correctCount;

    if (existing) {
        const updatedScore = Math.max(existing.points_earned, currentScore);
        await supabase
            .from('lesson_progress')
            .update({ points_earned: updatedScore })
            .eq('user_id', userId)
            .eq('lesson_id', lessonId);
    } else {
        await supabase.from('lesson_progress').insert({
            user_id: userId,
            lesson_id: lessonId,
            points_earned: currentScore
        });
    }

    // Marcar como completada si aún no lo estaba
    await supabase.from('completed_lessons').upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString()
    });

    // Aquí podrías agregar también la lógica para actualizar barras de progreso por módulo
}
