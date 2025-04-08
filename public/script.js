const apiUrl = 'http://localhost:3000/api';

// Функция для регистрации пользователя
async function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('Пользователь зарегистрирован');
    } else {
        alert('Ошибка регистрации: ' + (await response.text()));
    }
}

// Функция для входа пользователя
async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Сохраняем токен в локальном хранилище
        alert('Вход выполнен');
        loadPosts(); // Загружаем посты после успешного входа
    } else {
        alert('Ошибка входа: ' + (await response.text()));
    }
}

// Функция для загрузки постов
async function loadPosts() {
    const response = await fetch(`${apiUrl}/posts`);
    const posts = await response.json();
    const postList = document.getElementById('post-list');
    postList.innerHTML = ''; // Очищаем список постов

    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.textContent = `${post.username}: ${post.content}`; // Отображаем имя пользователя и содержание поста
        postList.appendChild(postElement);
    });
}

// Функция для добавления нового поста
async function addPost() {
    const content = document.getElementById('post-content').value;
    const token = localStorage.getItem('token'); // Получаем токен из локального хранилища

    const response = await fetch(`${apiUrl}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token // Передаем токен в заголовке
        },
        body: JSON.stringify({ content })
    });

    if (response.ok) {
        document.getElementById('post-content').value = ''; // Очищаем поле ввода
        loadPosts(); // Загружаем посты после добавления
    } else {
        alert('Ошибка добавления поста: ' + (await response.text()));
    }
}

// Загрузка постов при загрузке страницы
window.onload = loadPosts;
