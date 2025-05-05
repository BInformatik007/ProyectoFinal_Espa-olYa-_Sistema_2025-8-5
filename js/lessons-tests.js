import { supabase } from './supabaseClient.js';

const previewContainer = document.querySelector('.main-lessons-tests__preview-container');
const lessonContentContainer = document.querySelector('.main-lessons-tests__lesson-content-container');
const contentWrapper = document.querySelector('.main-lessons-test__lesson-content');
const nextBtn = lessonContentContainer.querySelectorAll('.main-lessons-tests__btn-nav')[1];
const backButton = lessonContentContainer.querySelector('.main-lessons-tests__btn-nav-back');

let currentActivity = 0;
let activities = [];
let correctCount = 0;
let currentLessonId = null;
let currentLessonModule = null;
let currentUser = null;
let sessionStartTime = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentLessonId = parseInt(urlParams.get('id'));

    if (!currentLessonId) return;

    // Obtener usuario autenticado
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
        console.error('No se pudo obtener el usuario');
        return;
    }
    currentUser = userData.user;

    sessionStartTime = new Date();

    // Cargar lección
    const { data: lessonData } = await supabase
        .from('lessons')
        .select('title, description, module_name')
        .eq('id', currentLessonId)
        .single();

    if (!lessonData) return;

    currentLessonModule = lessonData.module_name;
    document.querySelector('#lesson-title').textContent = lessonData.title;
    document.querySelector('#lesson-description').textContent = lessonData.description;

    // Cargar actividades
    const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('lesson_id', currentLessonId)
        .order('activity_number');

    activities = activitiesData;
});

document.getElementById('btn-siguiente').addEventListener('click', () => {
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
        saveLessonProgress();
    }
    nextBtn.disabled = true;
    nextBtn.classList.add('first-back-btn');
});

function showActivity() {
    const activity = activities[currentActivity];
    contentWrapper.innerHTML = '';

    const activityBox = document.createElement('div');
    activityBox.className = 'activity-box';

    const questionEl = document.createElement('p');
    questionEl.className = 'question';
    questionEl.textContent = `${currentActivity + 1}. ${activity.question}`;
    activityBox.appendChild(questionEl);

    if (activity.type === 'multiple_choice') {
        activity.options.forEach(option => {
            const btn = document.createElement('button');
            btn.textContent = option;
            btn.className = 'option-btn';
            btn.addEventListener('click', () => validateAnswer(btn, option, activity));
            activityBox.appendChild(btn);
        });
    } else if (activity.type === 'fill_in_blank') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = activity.hint || '';
        input.className = 'input-blank';
        activityBox.appendChild(input);

        const submit = document.createElement('button');
        submit.textContent = 'Verificar';
        submit.className = 'btn-check';
        submit.addEventListener('click', () => {
            validateAnswer(submit, input.value.trim(), activity);
        });
        activityBox.appendChild(submit);
    } else if (activity.type === 'ordering') {
        const ul = document.createElement('ul');
        ul.className = 'ordering-list';
        activity.options.forEach((text, index) => {
            const li = document.createElement('li');
            li.textContent = text;
            li.className = 'ordering-item';
            li.draggable = true;
            li.dataset.index = index;

            li.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', index);
            });

            li.addEventListener('dragover', e => {
                e.preventDefault();
                li.classList.add('drag-over');
            });

            li.addEventListener('dragleave', () => li.classList.remove('drag-over'));

            li.addEventListener('drop', e => {
                e.preventDefault();
                const draggedIndex = e.dataTransfer.getData('text/plain');
                const draggedEl = ul.children[draggedIndex];
                ul.insertBefore(draggedEl, index < draggedIndex ? li : li.nextSibling);
                Array.from(ul.children).forEach((li, i) => li.dataset.index = i);
            });

            ul.appendChild(li);
        });

        const checkBtn = document.createElement('button');
        checkBtn.textContent = 'Verificar';
        checkBtn.className = 'btn-check';
        checkBtn.addEventListener('click', () => {
            const userAnswer = Array.from(ul.children).map(li => li.textContent);
            const correct = JSON.stringify(userAnswer) === JSON.stringify(activity.correct_answer);
            showFeedback(correct, activity.explanation, ul);
            if (correct) correctCount++;
            nextBtn.disabled = false;
            nextBtn.classList.remove('first-back-btn');
        });

        activityBox.appendChild(ul);
        activityBox.appendChild(checkBtn);
    } else {
        const notSupported = document.createElement('p');
        notSupported.textContent = 'Tipo de actividad no soportado.';
        activityBox.appendChild(notSupported);
    }

    contentWrapper.appendChild(activityBox);
}

function validateAnswer(button, selected, activity) {
    const correct = activity.correct_answer[0];
    const isCorrect = selected === correct;

    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.textContent = isCorrect
        ? '✅ ¡Respuesta correcta!'
        : `❌ ¡Respuesta incorrecta! ${activity.explanation || 'Respuesta correcta: ' + correct}`;

    if (isCorrect) correctCount++;
    button.parentElement.appendChild(feedback);

    const allBtns = button.parentElement.querySelectorAll('button');
    allBtns.forEach(btn => btn.disabled = true);

    nextBtn.disabled = false;
    nextBtn.classList.remove('first-back-btn');
}

function showFeedback(isCorrect, explanation, container) {
    const p = document.createElement('p');
    p.className = 'feedback';
    p.textContent = isCorrect
        ? '✅ ¡Respuesta correcta!'
        : `❌ ¡Respuesta incorrecta! ${explanation || ''}`;
    p.style.color = isCorrect ? 'green' : 'red';
    container.parentElement.appendChild(p);
}

async function saveLessonProgress() {
    const totalPoints = activities.reduce((acc, act) => acc + act.points, 0);
    const earnedPoints = Math.round((correctCount / activities.length) * totalPoints);

    // Verificar si ya hay una entrada
    const { data: existing, error } = await supabase
        .from('completed_lessons')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('lesson_id', currentLessonId)
        .single();

    if (!existing) {
        await supabase.from('completed_lessons').insert({
            user_id: currentUser.id,
            lesson_id: currentLessonId,
            score: earnedPoints
        });
    } else if (existing.score < earnedPoints) {
        await supabase
            .from('completed_lessons')
            .update({ score: earnedPoints })
            .eq('user_id', currentUser.id)
            .eq('lesson_id', currentLessonId);
    }

    // Actualizar progreso por módulo
    const { data: allLessons } = await supabase
        .from('lessons')
        .select('id')
        .eq('module_name', currentLessonModule);

    const { data: completed } = await supabase
        .from('completed_lessons')
        .select('lesson_id')
        .eq('user_id', currentUser.id);

    const completedInModule = completed.filter(c =>
        allLessons.some(l => l.id === c.lesson_id)
    ).length;

    const { data: progressRow } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('module_name', currentLessonModule)
        .single();

    if (!progressRow) {
        await supabase.from('lesson_progress').insert({
            user_id: currentUser.id,
            module_name: currentLessonModule,
            lessons_completed: completedInModule
        });
    } else {
        await supabase
            .from('lesson_progress')
            .update({ lessons_completed: completedInModule })
            .eq('user_id', currentUser.id)
            .eq('module_name', currentLessonModule);
    }

    const sessionEndTime = new Date();

    await supabase.from('lesson_sessions').insert({
        user_id: currentUser.id,
        lesson_id: currentLessonId,
        started_at: sessionStartTime.toISOString(),
        ended_at: sessionEndTime.toISOString()
    });

    showSummary(earnedPoints);
}

function showSummary(score) {
    contentWrapper.innerHTML = `
        <div class="summary-card">
            <h2>Lección completada</h2>
            <p>Respondiste correctamente ${correctCount} de ${activities.length} actividades.</p>
            <p>Puntaje obtenido: ${score} puntos.</p>
            <a href="../html/lessons.html" class="main-lessons-tests__btn-nav">Volver a las lecciones</a>
        </div>
    `;

    // Ocultar botones previos
    lessonContentContainer.querySelector('.main-lessons-tests__btn-nav-container').style.display = 'none';
}
