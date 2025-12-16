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

// Глобальна змінна для статей
let articlesData = {};

// Завантаження контенту
async function fetchContent() {
    try {
        // Товари
        const prodRes = await fetch(`${window.API_BASE_URL}/api/products`);
        const products = await prodRes.json();

        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = products.map(p => `
                <div class="product-card">
                    <div class="product-image" style="${p.image_style}">
                        <div class="product-icon">📦</div>
                    </div>
                    <div class="product-content">
                        <h3>${p.name}</h3>
                        <p>${p.description}</p>
                        <ul class="product-features">
                           <li>Одиниця: ${p.unit}</li>
                        </ul>
                         <p class="price" style="font-size: 1.2rem; color: var(--primary-green); font-weight: bold; margin: 10px 0;">${p.price} грн/${p.unit}</p>
                        <button class="btn btn-primary" onclick="addToCart('${p.code}', '${p.name}', ${p.price})">Додати в кошик</button>
                    </div>
                </div>
            `).join('');
        }

        // Статті
        const artRes = await fetch(`${window.API_BASE_URL}/api/articles`);
        const articles = await artRes.json();

        const blogGrid = document.getElementById('blogGrid');
        if (blogGrid) {
            blogGrid.innerHTML = articles.map(a => {
                articlesData[a.slug] = a; // Зберігаємо для модального вікна
                return `
                <article class="blog-card">
                    <div class="blog-image" style="${a.image_style}">
                        <span class="blog-category">${a.category}</span>
                    </div>
                    <div class="blog-content">
                        <h3>${a.title}</h3>
                        <p class="blog-excerpt">${a.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...</p>
                        <button class="btn-read-more" onclick="showArticle('${a.slug}')">Читати далі →</button>
                    </div>
                </article>
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Не вдалося завантажити контент:', err);
    }
}

// Додаємо виклик при завантаженні
document.addEventListener('DOMContentLoaded', function () {
    fetchContent();
});

// Функція відображення статті
function showArticle(articleSlug) {
    const modal = document.getElementById('articleModal');
    const articleContent = document.getElementById('articleContent');
    const article = articlesData[articleSlug];

    if (article) {
        articleContent.innerHTML = article.content;
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
        const response = await fetch(`${window.API_BASE_URL}/api/orders`, {
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
