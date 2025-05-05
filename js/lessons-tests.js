import { supabase } from './supabaseClient.js';

const previewContainer = document.querySelector('.main-lessons-tests__preview-container');
const lessonContentContainer = document.querySelector('.main-lessons-tests__lesson-content-container');
const contentWrapper = document.querySelector('.main-lessons-test__lesson-content');
const nextBtn = lessonContentContainer.querySelectorAll('.main-lessons-tests__btn-nav')[1];
const backButton = lessonContentContainer.querySelector('.main-lessons-tests__btn-nav-back');
const navButtons = lessonContentContainer.querySelector('.main-lessons-tests__btn-nav-container');

let currentActivity = 0;
let activities = [];
let correctCount = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = parseInt(urlParams.get('id'));

    if (!lessonId) return;

    const { data: lessonData } = await supabase
        .from('lessons')
        .select('title, description')
        .eq('id', lessonId)
        .single();

    document.querySelector('#lesson-title').textContent = lessonData.title;
    document.querySelector('#lesson-description').textContent = lessonData.description;

    const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .eq('lesson_id', lessonId)
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
        showSummary();
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
            btn.addEventListener('click', () => validateMultipleChoice(btn, option, activity));
            activityBox.appendChild(btn);
        });

    } else if (activity.type === 'fill_in_blank') {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Escribe tu respuesta aquí';
        activityBox.appendChild(input);

        const checkBtn = document.createElement('button');
        checkBtn.textContent = 'Verificar';
        checkBtn.addEventListener('click', () => {
            const userAnswer = input.value.trim().toLowerCase();
            const correct = activity.correct_answer[0].toLowerCase();
            const feedback = document.createElement('p');
            feedback.className = 'feedback';

            if (userAnswer === correct) {
                feedback.textContent = '✅ ¡Respuesta correcta!';
                correctCount++;
            } else {
                feedback.textContent = `❌ Incorrecto. ${activity.explanation || 'Respuesta correcta: ' + correct}`;
            }

            activityBox.appendChild(feedback);
            checkBtn.disabled = true;
            input.disabled = true;

            nextBtn.disabled = false;
            nextBtn.classList.remove('first-back-btn');
        });

        activityBox.appendChild(checkBtn);

    } else if (activity.type === 'ordering') {
        const list = document.createElement('ul');
        list.className = 'ordering-list';

        const options = [...activity.options].sort(() => Math.random() - 0.5);

        options.forEach(text => {
            const item = document.createElement('li');
            item.textContent = text;
            item.draggable = true;
            item.className = 'ordering-item';

            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', e.target.textContent);
                e.target.classList.add('dragging');
            });

            item.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                const bounding = item.getBoundingClientRect();
                const offset = e.clientY - bounding.top;
                const middle = bounding.height / 2;

                if (offset > middle) {
                    item.parentNode.insertBefore(dragging, item.nextSibling);
                } else {
                    item.parentNode.insertBefore(dragging, item);
                }
            });

            item.addEventListener('drop', e => e.preventDefault());
            item.addEventListener('dragend', e => e.target.classList.remove('dragging'));

            list.appendChild(item);
        });

        activityBox.appendChild(list);

        const checkBtn = document.createElement('button');
        checkBtn.textContent = 'Verificar';
        checkBtn.addEventListener('click', () => {
            const userOrder = Array.from(list.children).map(li => li.textContent);
            const isCorrect = JSON.stringify(userOrder) === JSON.stringify(activity.correct_answer);

            const feedback = document.createElement('p');
            feedback.className = 'feedback';
            if (isCorrect) {
                feedback.textContent = '✅ ¡Correcto!';
                correctCount++;
            } else {
                feedback.textContent = `❌ Incorrecto. ${activity.explanation || 'Revisa el orden correcto.'}`;
            }

            checkBtn.disabled = true;
            list.querySelectorAll('li').forEach(li => li.draggable = false);

            nextBtn.disabled = false;
            nextBtn.classList.remove('first-back-btn');
            activityBox.appendChild(feedback);
        });

        activityBox.appendChild(checkBtn);

    } else {
        activityBox.innerHTML = `<p>Tipo de actividad no soportado: ${activity.type}</p>`;
    }

    contentWrapper.appendChild(activityBox);
}

function validateMultipleChoice(button, selected, activity) {
    const correct = activity.correct_answer[0];
    const isCorrect = selected === correct;

    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    feedback.textContent = isCorrect
        ? '✅ ¡Respuesta correcta!'
        : `❌ Incorrecto. ${activity.explanation || 'La respuesta correcta era: ' + correct}`;

    if (isCorrect) correctCount++;
    button.parentElement.appendChild(feedback);
    button.parentElement.querySelectorAll('button').forEach(btn => btn.disabled = true);

    nextBtn.disabled = false;
    nextBtn.classList.remove('first-back-btn');
}

function showSummary() {
    contentWrapper.innerHTML = `
        <div class="summary-card">
            <h2>🎉 ¡Lección completada!</h2>
            <p>Respondiste correctamente ${correctCount} de ${activities.length} actividades.</p>
            <p>${correctCount >= activities.length * 0.7 ? '¡Felicidades!' : '¡Sigue practicando!'}</p>
            <button class="main-lessons-tests__btn-nav" onclick="window.location.href='../html/lessons.html'">
                Volver a las lecciones
            </button>
        </div>
    `;
    navButtons.style.display = 'none';
}