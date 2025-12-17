// 1. ІНІЦІАЛІЗАЦІЯ ТА НАВІГАЦІЯ
document.addEventListener('DOMContentLoaded', function () {
    // Отримуємо посилання навігації
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Якщо посилання веде на секцію поточної сторінки (починається з #)
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(href);
                if (targetSection) {
                    // Плавна прокрутка до секції
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                    // Оновлення активного класу
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                }
            }
        });
    });

    // Мобільне меню (бургер)
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.querySelector('.nav-menu');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
    }

    // Зміна прозорості шапки при скролі
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

    // Завантаження даних з сервера при завантаженні сторінки
    fetchProducts();
    fetchArticles();
    fetchAdvice();
    updateCartBadge(); // Оновлення іконки кошика
});

// 2. РОБОТА З ТОВАРАМИ ТА API
async function fetchProducts() {
    try {
        // Запит до вашого server.js через URL з config.js
        const response = await fetch(`${window.API_BASE_URL}/api/products`);
        const products = await response.json();
        renderProducts(products); // Функція відображення (має бути у вашому HTML/CSS)
    } catch (err) {
        console.error('Помилка завантаження товарів:', err);
    }
}

// 3. СИСТЕМА КОШИКА (LocalStorage)
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Додавання товару в кошик
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    updateCartBadge();
    alert(`${name} додано до кошика!`);
}

// Збереження кошика в пам'ять браузера
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Оновлення цифри на іконці кошика
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.innerText = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// 4. ОФОРМЛЕННЯ ЗАМОВЛЕННЯ
async function handleCheckout(e) {
    e.preventDefault(); // Зупиняємо перезавантаження сторінки
    
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;

    if (!name || !phone || cart.length === 0) {
        alert('Заповніть дані та додайте товари в кошик');
        return;
    }

    // Формуємо об'єкт замовлення згідно з очікуваннями вашого server.js
    const orderData = {
        customerName: name,
        customerPhone: phone,
        items: cart,
        totalPrice: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    try {
        // Відправка замовлення на Render
        const response = await fetch(`${window.API_BASE_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            alert('Дякуємо! Замовлення успішно відправлено.');
            cart = []; // Очищаємо кошик
            saveCart();
            window.location.href = 'index.html'; // Повернення на головну
        } else {
            alert('Помилка сервера при створенні замовлення');
        }
    } catch (err) {
        console.error('Checkout error:', err);
        alert('Не вдалося з\'єднатися з сервером');
    }
}

// 5. ЧАТ-БОТ (Логіка відповідей)
function sendMessage() {
    const input = document.getElementById('chatInput');
    const container = document.getElementById('chatMessages');
    if (!input || !input.value.trim()) return;

    const userText = input.value.trim();
    appendMessage('user', userText); // Відображаємо повідомлення користувача
    input.value = '';

    // Проста логіка бота
    setTimeout(() => {
        const botResponse = getBotResponse(userText.toLowerCase());
        appendMessage('bot', botResponse);
    }, 600);
}

// Функція генерації відповідей бота
function getBotResponse(msg) {
    if (msg.includes('привіт') || msg.includes('добрий день')) return 'Вітаємо на фермі ТІМКО! Чим можемо допомогти?';
    if (msg.includes('ціна') || msg.includes('скільки')) return 'Актуальні ціни вказані в нашому каталозі товарів вище.';
    if (msg.includes('доставка')) return 'Ми доставляємо продукцію по всій області щовівторка та щоп’ятниці.';
    return 'Дякуємо за запитання! Наші менеджери зв’яжуться з вами найближчим часом.';
}

// Додавання візуального блоку повідомлення в чат
function appendMessage(type, text) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}-message`;
    msgDiv.innerText = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight; // Прокрутка вниз
}