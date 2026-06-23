document.getElementById('analyze-btn').addEventListener('click', async () => {
    const textInput = document.getElementById('sentence-input').value.trim();
    const resultBox = document.getElementById('result-box');
    const container = document.getElementById('words-container');
    
    if (!textInput) {
        alert('Введите хотя бы одно слово!');
        return;
    }

    try {
        // Отправляем POST-запрос на наш Flask API
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: textInput })
        });

        if (!response.ok) throw new Error('Ошибка сервера');

        const wordsData = await response.json();
        
        // Очищаем контейнер перед выводом новых результатов
        container.innerHTML = '';

        // Проходимся по каждому слову из ответа сервера
        wordsData.forEach(item => {
            const wordCard = document.createElement('div');
            wordCard.className = 'word-card';

            // Контейнер для визуального разбора (основа + окончание)
            const morphemeBlock = document.createElement('div');
            morphemeBlock.className = 'morpheme-block';

            let htmlContent = `<span class="stem">${item.stem}</span>`;
            if (item.ending) {
                htmlContent += `<span class="ending">${item.ending}</span>`;
            } else {
                htmlContent += `<span class="empty-ending">ⵘ</span>`;
            }
            morphemeBlock.innerHTML = htmlContent;

            // Контейнер для подробной морфологической информации
            const infoBlock = document.createElement('div');
            infoBlock.className = 'morph-info';
            infoBlock.innerHTML = `
                <div class="lemma"><b>Начальная форма:</b> ${item.lemma}</div>
                <div class="pos"><b>Часть речи:</b> ${item.pos}</div>
                ${item.features ? `<div class="features"><b>Признаки:</b> ${item.features}</div>` : ''}
            `;

            // Собираем всё в одну карточку
            wordCard.appendChild(morphemeBlock);
            wordCard.appendChild(infoBlock);
            container.appendChild(wordCard);
        });

        // ВАЖНО: Делаем блок с результатами видимым!
        resultBox.style.display = 'block';

    } catch (error) {
        console.error(error);
        alert('Не удалось выполнить анализ. Проверь консоль браузера или терминал бэкенда.');
    }
});

// Массив с примерами предложений
const placeholders = [
    "Быстрые кони весело бежали.",
    "Съешь ещё этих мягких французских булок, да выпей чаю.",
    "Подходит отец к сыну...",
    "В чащах юга жил бы цитрус, но фальшивый экземпляр!",
    "Широкая электрификация южных губерний даст мощный толчок подъёму сельского хозяйства.",
    "Открывает мужик записку, а там...",
    "Разъярённый чтец эгоистично забил в гонг, опустошив кубок шеллака.",
    "Программист быстро написал сложный код и успешно прошёл ревью.",
    "Заходит как-то улитка в бар...",
    "Эй, жёлтый хлыщ, разберите забор на дрова — хозяин приехал!",
    "Тихо струится река среди вековых дубов и зелёных холмов.",
    "Пепе шнейне ватафа.",
    "Любопытный кот запрыгнул на тёплый подоконник и замурчал от удовольствия."
];

const textarea = document.getElementById('sentence-input');
let placeholderIndex = 0;

// Функция для посимвольной печати плейсхолдера (эффект печатной машинки)
function typePlaceholder(text, index = 0) {
    // Если начали печатать новый текст, очищаем старый плейсхолдер
    if (index === 0) textarea.placeholder = "";
    
    if (index < text.length) {
        textarea.placeholder += text[index];
        setTimeout(() => typePlaceholder(text, index + 1), 50); // Скорость печати одной буквы
    } else {
        // Ждем 3 секунды, когда текст полностью напечатается, и запускаем стирание
        setTimeout(erasePlaceholder, 3000);
    }
}

// Функция для посимвольного стирания плейсхолдера
function erasePlaceholder() {
    const currentText = textarea.placeholder;
    if (currentText.length > 0) {
        textarea.placeholder = currentText.substring(0, currentText.length - 1);
        setTimeout(erasePlaceholder, 30); // Скорость стирания букв
    } else {
        // Переходим к следующему тексту в массиве
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        // Запускаем печать следующего текста
        setTimeout(() => typePlaceholder(placeholders[placeholderIndex]), 500);
    }
}

// Запускаем анимацию при загрузке страницы
// Сначала очищаем дефолтный плейсхолдер из HTML, если он там есть
textarea.placeholder = "";
setTimeout(() => typePlaceholder(placeholders[0]), 1000);