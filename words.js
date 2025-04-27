/* Скрипт для страницы "Мои слова" */
let currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
    window.location.href = 'login.html';
}
let wordsInProgress = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsInProgress')) || [];
let wordsLearned = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsLearned')) || [];

// Заполняем таблицы при загрузке страницы
const inProgressBody = document.getElementById('inProgressBody');
const learnedBody = document.getElementById('learnedBody');

// Таблица изучаемых слов
if (wordsInProgress.length === 0) {
    inProgressBody.innerHTML = '<tr><td colspan="4">Нет слов</td></tr>';
} else {
    let inRows = '';
    wordsInProgress.forEach(word => {
        inRows += 
            `<tr data-hanzi="${word.hanzi}">
                <td>${word.hanzi}</td>
                <td>${word.pinyin}</td>
                <td>${word.translation}</td>
                <td>
                    <button class="danger" onclick="deleteFromInProgress('${word.hanzi}')">Удалить</button>
                    <button class="success" onclick="moveToLearned('${word.hanzi}')">В&nbsp;выученные</button>
                </td>
            </tr>`;
    });
    inProgressBody.innerHTML = inRows;
}

// Таблица выученных слов
if (wordsLearned.length === 0) {
    learnedBody.innerHTML = '<tr><td colspan="4">Нет слов</td></tr>';
} else {
    let ldRows = '';
    wordsLearned.forEach(word => {
        ldRows += 
            `<tr data-hanzi="${word.hanzi}">
                <td>${word.hanzi}</td>
                <td>${word.pinyin}</td>
                <td>${word.translation}</td>
                <td>
                    <button class="danger" onclick="deleteFromLearned('${word.hanzi}')">Удалить</button>
                    <button class="success" onclick="moveToInProgress('${word.hanzi}')">В&nbsp;изучаемые</button>
                </td>
            </tr>`;
    });
    learnedBody.innerHTML = ldRows;
}

function deleteFromInProgress(hanzi) {
    // Удаляем слово из списка изучаемых
    const index = wordsInProgress.findIndex(w => w.hanzi === hanzi);
    if (index !== -1) {
        wordsInProgress.splice(index, 1);
        localStorage.setItem('user_' + currentUser + '_wordsInProgress', JSON.stringify(wordsInProgress));
    }
    // Удаляем строку таблицы
    const row = document.querySelector('#inProgressBody tr[data-hanzi="'+ hanzi +'"]');
    if (row) row.remove();
    // Если слов не осталось, показываем сообщение
    if (wordsInProgress.length === 0) {
        inProgressBody.innerHTML = '<tr><td colspan="4">Нет слов</td></tr>';
    }
}

function deleteFromLearned(hanzi) {
    const index = wordsLearned.findIndex(w => w.hanzi === hanzi);
    if (index !== -1) {
        wordsLearned.splice(index, 1);
        localStorage.setItem('user_' + currentUser + '_wordsLearned', JSON.stringify(wordsLearned));
    }
    const row = document.querySelector('#learnedBody tr[data-hanzi="'+ hanzi +'"]');
    if (row) row.remove();
    if (wordsLearned.length === 0) {
        learnedBody.innerHTML = '<tr><td colspan="4">Нет слов</td></tr>';
    }
}

function moveToLearned(hanzi) {
    // Перемещаем слово в выученные
    const word = wordsInProgress.find(w => w.hanzi === hanzi);
    if (!word) return;
    wordsInProgress = wordsInProgress.filter(w => w.hanzi !== hanzi);
    localStorage.setItem('user_' + currentUser + '_wordsInProgress', JSON.stringify(wordsInProgress));
    if (!wordsLearned.find(w => w.hanzi === hanzi)) {
        wordsLearned.push(word);
        localStorage.setItem('user_' + currentUser + '_wordsLearned', JSON.stringify(wordsLearned));
    }
    const row = document.querySelector('#inProgressBody tr[data-hanzi="'+ hanzi +'"]');
    if (row) row.remove();
    if (wordsInProgress.length === 0) {
        inProgressBody.innerHTML = '<tr><td colspan="4">Нет слов</td></tr>';
    }
    if (wordsLearned.length === 1) {
        learnedBody.innerHTML = '';
    }
    learnedBody.insertAdjacentHTML('beforeend',
        `<tr data-hanzi="${word.hanzi}">
            <td>${word.hanzi}</td>
            <td>${word.pinyin}</td>
            <td>${word.translation}</td>
            <td>
                <button class="danger" onclick="deleteFromLearned('${word.hanzi}')">Удалить</button>
                <button class="success" onclick="moveToInProgress('${word.hanzi}')">В&nbsp;изучаемые</button>
            </td>
        </tr>`);
}

function moveToInProgress(hanzi) {
    const word = wordsLearned.find(w => w.hanzi === hanzi);
    if (!word) return;
    wordsLearned = wordsLearned.filter(w => w.hanzi !== hanzi);
    localStorage.setItem('user_' + currentUser + '_wordsLearned', JSON.stringify(wordsLearned));
    if (!wordsInProgress.find(w => w.hanzi === hanzi)) {
        wordsInProgress.push(word);
        localStorage.setItem('user_' + currentUser + '_wordsInProgress', JSON.stringify(wordsInProgress));
    }
    const row = document.querySelector('#learnedBody tr[data-hanzi="'+ hanzi +'"]');
    if (row) row.remove();
    if (wordsLearned.length === 0) {
        learnedBody.innerHTML = '<tr><td colspan="4">Нет слов</td></tr>';
    }
    if (wordsInProgress.length === 1) {
        inProgressBody.innerHTML = '';
    }
    inProgressBody.insertAdjacentHTML('beforeend',
        `<tr data-hanzi="${word.hanzi}">
            <td>${word.hanzi}</td>
            <td>${word.pinyin}</td>
            <td>${word.translation}</td>
            <td>
                <button class="danger" onclick="deleteFromInProgress('${word.hanzi}')">Удалить</button>
                <button class="success" onclick="moveToLearned('${word.hanzi}')">В&nbsp;выученные</button>
            </td>
        </tr>`);
}

function downloadWords(type) {
    let data = [];
    if (type === 'inProgress') {
        data = wordsInProgress;
    } else {
        data = wordsLearned;
    }
    if (data.length === 0) {
        alert("Нет слов для сохранения!");
        return;
    }
    let content = '';
    data.forEach(word => {
        content += word.hanzi + ' – ' + word.pinyin + ' – ' + word.translation + '\n';
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = type === 'inProgress' ? 'in_progress_words.txt' : 'learned_words.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function goToDashboard() {
    window.location.href = 'dashboard.html';
}
