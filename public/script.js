// Навігація
document.addEventListener('DOMContentLoaded', function () {
    // Плавна прокрутка до секцій
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Check if it's a hash link
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href;
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });

                    // Оновлення активного пункту меню
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });

    // Мобільне меню
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.querySelector('.nav-menu');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
        });
    }

    // Зміна фону навігації при прокрутці
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Теми чату
    const topicButtons = document.querySelectorAll('.topic-btn');
    topicButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            topicButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const topic = this.getAttribute('data-topic');
            addSystemMessage(`Ви обрали тему: ${this.textContent}`);
        });
    });
});

// База знань для пошуку
const knowledgeBase = {
    'теплиця': {
        title: 'Органічне вирощування в теплицях',
        content: 'Для успішного органічного вирощування важливо обрати правильну теплицю (полікарбонатну або скляну), забезпечити сонячне розташування, використовувати органічні добрива (біогумус, компост), дотримуватися сівозміни та застосовувати природні методи захисту від шкідників.'
    },
    'овочі': {
        title: 'Вирощування органічних овочів',
        content: 'У теплиці можна вирощувати помідори, огірки, перець, баклажани, салати, зелень. Важливо використовувати якісне насіння, органічні добрива, забезпечити крапельний полив та регулярне провітрювання.'
    },
    'ґрунт': {
        title: 'Підготовка ґрунту',
        content: 'Використовуйте ЕМ-компости з гною та пташиного посліду, біогумус, біопрепарати на основі корисних бактерій. Мульчуйте рослинними рештками для підвищення родючості.'
    },
    'сівозміна': {
        title: 'Правила сівозміни',
        content: 'Не садіть помідори після огірків, баклажанів, картоплі або перцю. Кращі попередники для помідорів - цибуля та бобові. Це допомагає запобігти виснаженню ґрунту та хворобам.'
    },
    'шкідники': {
        title: 'Захист від шкідників',
        content: 'Використовуйте ентомофагів, рослини-приманки, корисні бактерії-пробіотики. Деякі фермери застосовують земляних жаб для боротьби з білокрилками та попелицями. Важливе провітрювання та оптимальна густота посіву.'
    },
    'кури': {
        title: 'Вирощування органічної птиці',
        content: 'Забороняється утримання в клітках. Забезпечте вільний вигул (4 м² на курку), органічні корми, комфортну температуру. В одному приміщенні - не більше 3000 курей-несучок або 4800 курчат.'
    },
    'птиця': {
        title: 'Органічне птахівництво',
        content: 'Птиця повинна мати доступ до вигулу, харчуватися органічними кормами. Заборонено використання хімічних препаратів. Регулярне очищення приміщень обов\'язкове.'
    },
    'годівля': {
        title: 'Годівля птиці',
        content: 'Курчат годують стартовим комбікормом до 3 тижнів, потім переводять на домашній корм. Влітку птиця може самостійно знаходити комах та траву на вигулі.'
    },
    'кози': {
        title: 'Утримання кіз',
        content: 'Приміщення має бути сухим, чистим, теплим (+10 до +25°С), без протягів. Основа раціону - трава та сіно, гілки дерев. Забезпечте вільний випас для якісного молока.'
    },
    'молоко': {
        title: 'Козяче молоко',
        content: 'Козяче молоко дієтичне, має низький рівень холестерину, багате на кальцій та корисні елементи. Вільний випас у лісі покращує якість молока та усуває специфічний запах.'
    },
    'сертифікація': {
        title: 'Органічна сертифікація',
        content: 'Необхідно уникати синтетичних хімікатів, ГМО, утримувати угіддя вільними від заборонених речовин 3+ роки, вести детальний облік, забезпечити відокремлення органічної продукції. Сертифікат діє 15 місяців.'
    },
    'органічне': {
        title: 'Принципи органічного господарства',
        content: 'Використання технологій, що не шкодять здоров\'ю людей і довкіллю. Гуманне ставлення до тварин. Відмова від хімікатів, пестицидів, антибіотиків та ГМО.'
    }
};

// Статті для блогу
const articles = {
    greenhouse: {
        title: 'Органічне вирощування овочів у теплицях',
        content: `
            <h2>Органічне вирощування овочів у теплицях</h2>
            
            <p>Органічне вирощування овочів у теплицях стає все більш популярним в Україні, пропонуючи можливість отримати екологічно чистий урожай без шкідливих хімікатів. Цей підхід забезпечує стабільний урожай незалежно від сезону та зменшує негативний вплив на довкілля.</p>

            <h3>1. Вибір теплиці та її розташування</h3>
            <p>Для успішного органічного вирощування важливо обрати теплицю, яка відповідає певним вимогам:</p>
            <ul>
                <li><strong>Полікарбонатні теплиці</strong> - ефективні завдяки теплоізоляційним властивостям та довговічності</li>
                <li><strong>Скляні теплиці</strong> - добре пропускають світло, але потребують міцної конструкції</li>
                <li><strong>Розташування</strong> - обирайте сонячне місце для забезпечення достатньої кількості світла</li>
            </ul>

            <h3>2. Підготовка ґрунту</h3>
            <p>В органічному землеробстві не використовуються хімічні добрива. Основна увага приділяється органічним методам:</p>
            <ul>
                <li>Мульчування рослинними рештками</li>
                <li>Застосування біопрепаратів на основі корисних бактерій</li>
                <li>ЕМ-компости з гною та пташиного посліду</li>
                <li>Біогумус для підвищення родючості</li>
            </ul>

            <h3>3. Сівозміна</h3>
            <p>Правильна сівозміна є ключовим елементом органічного овочівництва:</p>
            <ul>
                <li>Помідори НЕ рекомендується садити після огірків, баклажанів, картоплі або перцю</li>
                <li>Кращі попередники для помідорів - цибуля та бобові</li>
                <li>Сівозміна допомагає запобігти виснаженню ґрунту та поширенню хвороб</li>
            </ul>

            <h3>4. Полив та освітлення</h3>
            <p>Регулярний полив є важливим, при цьому слід уникати як пересихання, так і перезволоження ґрунту:</p>
            <ul>
                <li>Температура води має відповідати температурі ґрунту</li>
                <li>Ідеальний варіант - крапельний полив</li>
                <li>Вентиляція критично важлива для циркуляції повітря</li>
            </ul>

            <h3>5. Захист від шкідників та хвороб</h3>
            <p>В органічному вирощуванні застосовуються природні методи боротьби:</p>
            <ul>
                <li>Використання ентомофагів (корисних комах)</li>
                <li>Рослини-приманки для відвернення шкідників</li>
                <li>Корисні бактерії-пробіотики для стримування патогенної мікрофлори</li>
                <li>Земляні жаби для боротьби з білокрилками, попелицями та слимаками</li>
                <li>Профілактика: сівозміна, видалення рослинних залишків, провітрювання</li>
            </ul>

            <h3>6. Вибір культур</h3>
            <p>У теплиці можна вирощувати багато видів овочів:</p>
            <ul>
                <li>Помідори та огірки (найпопулярніші тепличні культури)</li>
                <li>Редис, цибуля, салати</li>
                <li>Різні види капусти</li>
                <li>Кабачки, баклажани</li>
                <li>Зелень (петрушка, кріп, базилік)</li>
            </ul>

            <h3>Висновок</h3>
            <p>Вирощування органічних овочів у теплицях є перспективним напрямком, що дозволяє отримувати якісну продукцію, яка має високий попит на ринку. Дотримання органічних принципів забезпечує здоров'я споживачів та збереження довкілля.</p>
        `
    },
    poultry: {
        title: 'Вирощування органічної птиці',
        content: `
            <h2>Вирощування органічної птиці</h2>
            
            <p>Вирощування органічної птиці в Україні є перспективним напрямком сільського господарства, що стрімко розвивається. Органічне птахівництво об'єднує традиційні методи ведення господарства з інноваційними технологіями.</p>

            <h3>Законодавча база та сертифікація</h3>
            <p>Органічною вважається лише та продукція, яка має відповідний сертифікат. В Україні діє Закон «Про виробництво та обіг органічної сільськогосподарської продукції та сировини». Більшість виробників орієнтуються на стандарти ЄС.</p>
            <h3>Походження тварин</h3>
            <ul>
                <li>Органічні тварини повинні бути інкубовані та вирощені в органічних підрозділах</li>
                <li>Якщо придбати сертифікованих тварин неможливо, дозволяється закупівля звичайних курчат віком до трьох днів</li>
            </ul>

            <h3>Добробут та умови утримання</h3>
            <ul>
                <li><strong>ЗАБОРОНЕНО</strong> утримувати птицю в клітках</li>
                <li>Необхідно забезпечити доступ до майданчиків вільного вигулу</li>
                <li>За стандартами ЄС, на кожну курку має припадати 4 м² площі вігулу</li>
                <li>Пташники повинні бути обладнані сідалами відповідного розміру</li>
                <li>Загальна площа пташників для виробництва м'яса не повинна перевищувати 1600 м²</li>
            </ul>

            <h3>Норми утримання в одному приміщенні:</h3>
            <ul>
                <li>Не більше 4800 курчат</li>
                <li>Не більше 3000 курей-несучок</li>
                <li>Не більше 5200 цесарок</li>
                <li>Не більше 4000 мускусних або пекінських качок</li>
                <li>Не більше 2500 каплунів, гусей або індиків</li>
            </ul>

            <h3>Годівля</h3>
            <p>Тварини повинні годуватися органічними кормами. Важливо забезпечити збалансовані раціони для курей-несучок різного віку.</p>
            <ul>
                <li>Курчат годують стартовим комбікормом до тритижневого віку</li>
                <li>Потім поступово переводять на домашній корм</li>
                <li>Влітку птиця може самостійно знаходити частину їжі на вигулі (комах, траву)</li>
            </ul>

            <h3>Здоров'я та ветеринарія</h3>
            <ul>
                <li>Заборонено використання хімічних алопатичних ветеринарних препаратів (крім випадків, визначених законодавством)</li>
                <li>Акцент на превентивні заходи</li>
                <li>Використання натуральних профілактичних препаратів</li>
                <li>Зміцнення імунної системи птиці природними методами</li>
                <li>Регулярне очищення та дезінфекція приміщень</li>
            </ul>

            <h3>Практичні поради для початківців</h3>
            <p><strong>Вибір місця та облаштування курника:</strong></p>
            <ul>
                <li>Вікна розташовуйте на південній стороні</li>
                <li>Лаз для виходу на вулицю - на східній стороні</li>
                <li>Обов'язкова вентиляція</li>
                <li>Встановіть сідала та гнізда</li>
                <li>Забезпечте чистоту підстилки</li>
            </ul>

            <p><strong>Вибір птиці:</strong></p>
            <ul>
                <li>Обирайте породи, адаптовані до місцевих умов</li>
                <li>М'ясо-яєчні породи, що швидко ростуть та добре несуться</li>
                <li>Стійкі до хвороб породи</li>
            </ul>

            <p><strong>Догляд:</strong></p>
            <ul>
                <li>Підтримуйте температуру від -2°C до +27°C</li>
                <li>Поставте ящик із сумішшю піску та золи для самоочищення пір'я</li>
            </ul>

            <h3>Висновок</h3>
            <p>Незважаючи на те, що органічне тваринництво в Україні розвивається повільніше, ніж рослинництво, воно має значний потенціал. Успішні приклади українських ферм демонструють перспективність цього напрямку.</p>
        `
    },
    goats: {
        title: 'Утримання кіз на органічній фермі',
        content: `
            <h2>Утримання кіз на органічній фермі</h2>
            
            <p>Органічне козівництво в Україні є перспективним напрямком, що стрімко розвивається, поєднуючи традиційні підходи з сучасними вимогами до екологічно чистої продукції.</p>

            <h3>Органічна сертифікація в Україні</h3>
            <p>Україна має власну систему сертифікації органічного виробництва, яка відповідає міжнародним вимогам, зокрема стандартам ЄС.</p>
            <h3>Вимоги для отримання органічного сертифіката:</h3>
            <ul>
                <li>Уникати використання синтетичних хімічних речовин (добрив, пестицидів, антибіотиків)</li>
                <li>Не використовувати опромінення та ГМО</li>
                <li>Утримувати сільськогосподарські угіддя вільними від заборонених хімічних речовин протягом кількох років (зазвичай від трьох і більше)</li>
                <li>Дотримуватися особливих вимог щодо кормів, утримання та розведення тварин</li>
                <li>Вести детальний облік виробництва та продажів</li>
                <li>Забезпечити суворе фізичне відокремлення органічної продукції від неорганічної</li>
                <li>Проходити періодичні перевірки на місцях</li>
            </ul>

            <p><strong>Важливо:</strong> Сертифікат діє протягом 15 місяців з дати видачі. Лише сертифіковані виробники мають право використовувати термін "органічний" на своїй продукції.</p>

            <h3>Поради щодо утримання кіз</h3>

            <h4>1. Приміщення</h4>
            <p>Кози невибагливі до умов утримання, але приміщення має відповідати певним вимогам:</p>
            <ul>
                <li>Сухе, чисте, тепле</li>
                <li>Без протягів</li>
                <li>З хорошою вентиляцією</li>
                <li>З достатнім освітленням</li>
                <li>Вікна на висоті 1,5-1,75 м від підлоги або захищені дротяною сіткою</li>
                <li>Комфортна температура для дійних кіз: від +10 до +25°С</li>
            </ul>

            <h4>2. Годівля</h4>
            <p>Основою раціону кіз є трава та сіно. Вони також охоче їдять гілки, пагони та кору дерев, що є поживним кормом.</p>
            
            <p><strong>Зимовий раціон на одну козу:</strong></p>
            <ul>
                <li>Щонайменше 2 кг сіна</li>
                <li>4 кг турнепсу</li>
                <li>500 г висівок</li>
                <li>250 г макухи</li>
                <li>Мінеральні добавки</li>
            </ul>

            <p><strong>Режим годівлі:</strong> Тричі на день, у строго визначений час</p>

            <h4>3. Випас</h4>
            <p>Вільний випас, особливо в лісовій місцевості, позитивно впливає на якість молока:</p>
            <ul>
                <li>Кози споживають різноманітні рослини</li>
                <li>Молоко не має специфічного запаху</li>
                <li>Підвищується якість продукції</li>
                <li>Тварини природно зміцнюють імунітет</li>
            </ul>

            <h4>4. Здоров'я та добробут</h4>
            <ul>
                <li>Забезпечення адекватних умов утримання допомагає уникнути більшості проблем зі здоров'ям</li>
                <li>Уникайте перенаселення</li>
                <li>Мінімізуйте використання медикаментів</li>
                <li>Дозволяйте тваринам самостійно знаходити лікувальні рослини при легких недугах</li>
                <li>Гуманне ставлення до тварин</li>
                <li>Створення умов, що відповідають біологічним потребам</li>
            </ul>

            <h4>5. Розведення</h4>
            <ul>
                <li>Статеве дозрівання у кіз настає у 5-7 місяців</li>
                <li>Зводити рекомендується не раніше півтора року</li>
                <li>Тривалість вагітності: 21-23 тижні</li>
                <li>Зазвичай народжується 1-5 козенят</li>
                <li>Щорічне отримання приплоду сприяє високій молочній продуктивності</li>
            </ul>

            <h3>Переваги козячого молока</h3>
            <ul>
                <li>Дієтичний продукт</li>
                <li>Низький рівень холестерину та цукру</li>
                <li>Багате на корисні елементи та кальцій</li>
                <li>Легко засвоюється організмом</li>
                <li>Підходить для людей з алергією на коров'яче молоко</li>
            </ul>

            <h3>Перспективи органічного козівництва в Україні</h3>
            <p>В Україні промислове козівництво поки що розвинене недостатньо, більшість господарств є невеликими. Однак низький рівень конкуренції та зростаючий попит на органічну продукцію створюють сприятливі умови для розвитку цього бізнесу.</p>

            <p>Українські фермери вже успішно створюють козині ферми, орієнтовані на виробництво якісних молочних продуктів та сирів, що демонструє перспективність цього напрямку.</p>
        `
    }
};

// Функція відображення статті
function showArticle(articleId) {
    const modal = document.getElementById('articleModal');
    const articleContent = document.getElementById('articleContent');

    if (articles[articleId]) {
        articleContent.innerHTML = articles[articleId].content;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Функція закриття статті
function closeArticle() {
    const modal = document.getElementById('articleModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Закриття модального вікна при кліку поза ним
window.onclick = function (event) {
    const modal = document.getElementById('articleModal');
    if (event.target === modal) {
        closeArticle();
    }
}

// Функція пошуку інформації
function searchInfo() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        searchResults.innerHTML = '<div class="search-result-item">Введіть запит для пошуку</div>';
        return;
    }

    let results = [];

    // Пошук у базі знань
    for (let key in knowledgeBase) {
        if (query.includes(key) || key.includes(query)) {
            results.push(knowledgeBase[key]);
        }
    }

    // Відображення результатів
    if (results.length > 0) {
        searchResults.innerHTML = results.map(result => `
            <div class="search-result-item">
                <strong>${result.title}</strong><br>
                <small>${result.content}</small>
            </div>
        `).join('');
    } else {
        searchResults.innerHTML = `
            <div class="search-result-item">
                На жаль, за вашим запитом "${query}" нічого не знайдено. 
                Спробуйте інші ключові слова: теплиця, овочі, кури, птиця, кози, молоко, сертифікація.
            </div>
        `;
    }
}

// Обробка Enter в полі пошуку
document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchInfo();
            }
        });
    }
});

// Функція додавання системного повідомлення
function addSystemMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system-message';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функція додавання повідомлення користувача
function addUserMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функція додавання відповіді бота
function addBotMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Функція відправки повідомлення
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message) return;

    // Додаємо повідомлення користувача
    addUserMessage(message);
    chatInput.value = '';

    // Генеруємо відповідь на основі ключових слів
    setTimeout(() => {
        const response = generateResponse(message.toLowerCase());
        addBotMessage(response);
    }, 500);
}

// Функція генерації відповіді
function generateResponse(message) {
    // Пошук відповіді в базі знань
    for (let key in knowledgeBase) {
        if (message.includes(key)) {
            return `<strong>${knowledgeBase[key].title}</strong><br><br>${knowledgeBase[key].content}`;
        }
    }

    // Загальні відповіді
    if (message.includes('привіт') || message.includes('добрий день')) {
        return 'Вітаємо! Як ми можемо вам допомогти? Задавайте питання про органічне господарство, теплиці, птахівництво чи козівництво.';
    }

    if (message.includes('дякую')) {
        return 'Будь ласка! Якщо у вас є ще питання - звертайтеся!';
    }

    if (message.includes('ціна') || message.includes('вартість')) {
        return 'Для уточнення цін на нашу продукцію, будь ласка, зв\'яжіться з нами за телефоном або через форму контактів.';
    }

    if (message.includes('де') || message.includes('адреса')) {
        return 'Наша ферма знаходиться в Київській області, село Органічне. Детальну інформацію можна знайти в розділі "Контакти".';
    }

    // Відповідь за замовчуванням
    return 'Дякуємо за ваше повідомлення! Для отримання детальної інформації рекомендуємо переглянути наш блог та розділ "Наші поради". Також ви можете використати пошук для знаходження потрібної інформації. Ключові теми: теплиці, овочі, птахівництво, козівництво, органічна сертифікація.';
}

// Обробка Enter в чаті
document.addEventListener('DOMContentLoaded', function () {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Обробка форми контактів (звичайна, не checkout)
    const contactForm = document.querySelector('.contact-form:not(.checkout-form)');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('Дякуємо за ваше повідомлення! Ми зв\'яжемося з вами найближчим часом.');
            contactForm.reset();
        });
    }
});


// --- КОШИК ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    updateCartCount();
    alert(`Товар "${name}" додано до кошика!`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartPage();
    updateCartCount();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const countElement = document.getElementById('cartCount');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        countElement.innerText = totalItems;
    }
}

function renderCartPage() {
    const cartContainer = document.getElementById('cartContainer');
    const totalPriceElement = document.getElementById('totalPrice');
    const checkoutSection = document.getElementById('checkoutSection');

    if (!cartContainer) return; // Not on cart page

    if (cart.length === 0) {
        cartContainer.innerHTML = '<div class="empty-cart-message">Ваш кошик порожній</div>';
        if (checkoutSection) checkoutSection.style.display = 'none';
        return;
    }

    let total = 0;
    cartContainer.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.price} грн x ${item.quantity}</p>
                </div>
                <div class="item-actions">
                    <span class="item-price">${itemTotal} грн</span>
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')">Видалити</button>
                </div>
            </div>
        `;
    }).join('');

    if (totalPriceElement) totalPriceElement.innerText = total;
    if (checkoutSection) checkoutSection.style.display = 'block';
}

async function handleCheckout(e) {
    e.preventDefault();
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;

    if (!name || !phone) {
        alert('Будь ласка, заповніть всі поля');
        return;
    }

    const orderData = {
        customerName: name,
        customerPhone: phone,
        items: cart,
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Замовлення успішно оформлено! Ми зв\'яжемося з вами.');
            cart = [];
            saveCart();
            window.location.href = 'index.html';
        } else {
            const data = await response.json();
            alert('Помилка при оформленні замовлення: ' + (data.error || 'Невідома помилка'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Помилка з\'єднання з сервером');
    }
}

// Initialize count on load
document.addEventListener('DOMContentLoaded', updateCartCount);
