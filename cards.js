/* Скрипт для страницы карточек (обучение словам) */
let flashcards = [];
let flashcardIndex = 0;
let currentUser = localStorage.getItem('currentUser');

window.onload = function() {
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    // Получаем список слов для изучения из локального хранилища
    flashcards = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsInProgress')) || [];
    if (flashcards.length === 0) {
        alert("Нет изучаемых слов! Сначала добавьте слова.");
        window.location.href = 'dashboard.html';
        return;
    }
    // Очищаем список выученных слов на экране
    document.getElementById('learned-words').innerHTML = '';
    showFlashcard();
    updateProgress();
};

function showFlashcard() {
    // Показать текущую карточку (лицевая сторона)
    document.getElementById('flashcard').classList.remove('flipped');
    const word = flashcards[flashcardIndex];
    document.getElementById('hanzi').innerText = word.hanzi;
    document.getElementById('pinyin').innerText = word.pinyin;
    document.getElementById('translation').innerText = word.translation;
}

function flipCard() {
    // Переворот карточки
    document.getElementById('flashcard').classList.toggle('flipped');
}

function markCorrect() {
    // Помечаем слово как выученное
    const word = flashcards.splice(flashcardIndex, 1)[0];
    // Добавляем слово в список выученных в локальном хранилище
    let userLearned = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsLearned')) || [];
    if (!userLearned.find(w => w.hanzi === word.hanzi)) {
        userLearned.push(word);
        localStorage.setItem('user_' + currentUser + '_wordsLearned', JSON.stringify(userLearned));
    }
    // Удаляем слово из списка изучаемых в локальном хранилище
    let userInProgress = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsInProgress')) || [];
    userInProgress = userInProgress.filter(w => w.hanzi !== word.hanzi);
    localStorage.setItem('user_' + currentUser + '_wordsInProgress', JSON.stringify(userInProgress));
    // Обновляем прогресс на экране
    updateProgress();
    // Добавляем слово в список выученных на странице
    const learnedDiv = document.getElementById('learned-words');
    learnedDiv.insertAdjacentHTML('beforeend', '<span class="learned-item">' + word.hanzi + '</span> ');
    // Если все слова выучены
    if (flashcards.length === 0) {
        alert("Все слова выучены! Возвращаемся в личный кабинет.");
        window.location.href = 'dashboard.html';
        return;
    }
    // Переходим к следующей карточке (если удалили последнюю, то индекс 0)
    flashcardIndex = flashcardIndex % flashcards.length;
    showFlashcard();
}

function markWrong() {
    // Оставляем слово в списке и переходим дальше
    flashcardIndex = (flashcardIndex + 1) % flashcards.length;
    showFlashcard();
}

function previousFlashcard() {
    if (flashcards.length === 0) return;
    flashcardIndex = (flashcardIndex - 1 + flashcards.length) % flashcards.length;
    showFlashcard();
}

function nextFlashcardManual() {
    if (flashcards.length === 0) return;
    flashcardIndex = (flashcardIndex + 1) % flashcards.length;
    showFlashcard();
}

function updateProgress() {
    const totalInProgress = flashcards.length;
    // Количество уже выученных слов у пользователя (все время)
    const totalLearned = JSON.parse(localStorage.getItem('user_' + currentUser + '_wordsLearned'))?.length || 0;
    const percent = totalInProgress + totalLearned > 0 ? Math.round((totalLearned / (totalInProgress + totalLearned)) * 100) : 0;
    document.getElementById('progress-bar').style.width = percent + '%';
    document.getElementById('progress-text').innerText = totalLearned + ' выучено из ' + (totalInProgress + totalLearned) + ' (' + percent + '%)';
}

function saveUnknownWords() {
    if (flashcards.length === 0) {
        alert("Нет незнакомых слов для сохранения!");
        return;
    }
    let content = '';
    flashcards.forEach(word => {
        content += word.hanzi + ' – ' + word.pinyin + ' – ' + word.translation + '\n';
    });
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'unknown_words.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
