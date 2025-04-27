/* Основной скрипт для выбора слов и управления списками слов */
let currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
    // Если пользователь не авторизован, переходим на страницу входа
    window.location.href = 'login.html';
}
const levelFile = localStorage.getItem('selectedLevel');
if (levelFile) {
    fetch(levelFile)
        .then(response => response.json())
        .then(words => {
            const wordGrid = document.getElementById('word-grid');
            wordGrid.innerHTML = '';
            window.words = words;
            words.forEach((word, index) => {
                // Создаем элемент для каждого слова
                const label = document.createElement('label');
                label.className = 'word-option';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = index;
                checkbox.className = 'word-checkbox';
                const span = document.createElement('span');
                span.innerHTML = `<strong>${word.hanzi}</strong> — ${word.translation}`;
                // Отмечаем слова, которые уже были в изучении ранее
                let inProgress = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsInProgress')) || [];
                if (inProgress.find(w => w.hanzi === word.hanzi)) {
                    checkbox.checked = true;
                }
                label.appendChild(checkbox);
                label.appendChild(span);
                // Обработчик для изменения фона выбранных слов
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        label.classList.add('selected');
                    } else {
                        label.classList.remove('selected');
                    }
                });
                // Если слово уже отмечено (изучается), сразу добавляем класс
                if (checkbox.checked) {
                    label.classList.add('selected');
                }
                wordGrid.appendChild(label);
            });
        });
}
function selectAllWords() {
    document.querySelectorAll('.word-checkbox').forEach(cb => cb.checked = true);
}
function resetAllWords() {
    document.querySelectorAll('.word-checkbox').forEach(cb => cb.checked = false);
}
function prepareFlashcards() {
    const checkboxes = document.querySelectorAll('.word-checkbox');
    // Собираем выбранные слова
    let selectedWords = [];
    checkboxes.forEach((cb, idx) => {
        if (cb.checked) {
            selectedWords.push(window.words[parseInt(cb.value)]);
        }
    });
    if (selectedWords.length === 0) {
        alert("Выберите слова для изучения");
        return;
    }
    // Получаем текущий список изучаемых слов пользователя и добавляем новые
    let userInProgress = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsInProgress')) || [];
    selectedWords.forEach(word => {
        if (!userInProgress.find(w => w.hanzi === word.hanzi)) {
            userInProgress.push(word);
        }
    });
    localStorage.setItem('user_' + currentUser + '_wordsInProgress', JSON.stringify(userInProgress));
    alert("Выбранные слова добавлены в список изучаемых.");
}
function saveUnknownWords() {
    const checkboxes = document.querySelectorAll('.word-checkbox');
    let selectedWords = [];
    checkboxes.forEach((cb, idx) => {
        if (cb.checked) {
            selectedWords.push(window.words[parseInt(cb.value)]);
        }
    });
    if (selectedWords.length === 0) {
        alert("Нет выбранных слов для сохранения!");
        return;
    }
    // Формируем содержимое файла
    let content = '';
    selectedWords.forEach(word => {
        content += `${word.hanzi} – ${word.pinyin} – ${word.translation}\n`;
    });
    // Создаем и инициируем скачивание текстового файла
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'words.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
function selectLevelAgain() {
    window.location.href = 'levels.html';
}
