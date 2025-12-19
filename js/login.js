// Логика страницы входа/регистрации
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const tabBtns = document.querySelectorAll('.tab-btn');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const demoAccessBtn = document.getElementById('demoAccessBtn');
    const demoModal = document.getElementById('demoModal');
    const closeModalBtn = demoModal.querySelector('.modal-close');
    const demoRoleBtns = document.querySelectorAll('.demo-role-btn');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // Переключение между вкладками
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            // Обновляем активную вкладку
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Показываем соответствующую форму
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Переключение видимости пароля
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        });
    });
    
    // Обработка формы входа
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Валидация
        if (!email || !password) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        // Показать индикатор загрузки
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Вход...';
        submitBtn.disabled = true;
        
        // Используем нашу систему аутентификации
        const result = auth.login(email, password);
        
        setTimeout(() => {
            if (result.success) {
                showNotification(`Добро пожаловать, ${result.user.name}!`, 'success');
                
                // Перенаправляем на dashboard
                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1000);
            } else {
                showNotification(result.message, 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }, 1000);
    });
    
    // Обработка формы регистрации
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            name: document.getElementById('regName').value,
            email: document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            role: document.getElementById('regRole').value
        };
        
        // Валидация
        if (!userData.name || !userData.email || !userData.password || !userData.role) {
            showNotification('Пожалуйста, заполните все поля', 'error');
            return;
        }
        
        if (userData.password.length < 6) {
            showNotification('Пароль должен содержать не менее 6 символов', 'error');
            return;
        }
        
        // Показать индикатор загрузки
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Регистрация...';
        submitBtn.disabled = true;
        
        // Регистрация через нашу систему
        const result = auth.register(userData);
        
        setTimeout(() => {
            if (result.success) {
                showNotification(`Аккаунт успешно создан! Добро пожаловать, ${result.user.name}!`, 'success');
                
                // Перенаправляем на dashboard
                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1500);
            } else {
                showNotification(result.message, 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }, 1000);
    });
    
    // Демо-доступ
    demoAccessBtn.addEventListener('click', function(e) {
        e.preventDefault();
        demoModal.classList.add('active');
    });
    
    // Закрытие модального окна
    closeModalBtn.addEventListener('click', function() {
        demoModal.classList.remove('active');
    });
    
    // Выбор роли для демо
    demoRoleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const role = this.dataset.role;
            
            // Создаем демо-пользователя
            const demoUsers = {
                student: {
                    email: 'demo-student@openedu.kz',
                    password: 'demo123',
                    name: 'Демо Ученик',
                    role: 'student'
                },
                mentor: {
                    email: 'demo-mentor@openedu.kz',
                    password: 'demo123',
                    name: 'Демо Ментор',
                    role: 'mentor'
                },
                parent: {
                    email: 'demo-parent@openedu.kz',
                    password: 'demo123',
                    name: 'Демо Родитель',
                    role: 'parent'
                }
            };
            
            const demoUser = demoUsers[role];
            
            // Логинимся под демо-пользователем
            const result = auth.login(demoUser.email, demoUser.password);
            
            if (result.success) {
                // Помечаем как демо-сессию
                localStorage.setItem('isDemo', 'true');
                
                showNotification(`Демо-режим: ${demoUser.name}`, 'success');
                demoModal.classList.remove('active');
                
                // Перенаправляем на dashboard
                setTimeout(() => {
                    window.location.href = result.redirect + '?demo=true';
                }, 1000);
            }
        });
    });
    
    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        
        let icon = 'info-circle';
        let bgColor = '#3B82F6';
        
        if (type === 'success') {
            icon = 'check-circle';
            bgColor = '#10B981';
        } else if (type === 'error') {
            icon = 'exclamation-circle';
            bgColor = '#EF4444';
        }
        
        notification.innerHTML = `
            <div class="notification-content" style="background-color: ${bgColor};">
                <i class="fas fa-${icon}"></i>
                <span>${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});