// Логика панели управления
document.addEventListener('DOMContentLoaded', function() {
    // Проверка авторизации
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    const currentUser = auth.getCurrentUser();
    const isDemo = localStorage.getItem('isDemo') === 'true';
    
    // Элементы DOM
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar');
    const progressChartCanvas = document.getElementById('progressChart');
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    const userAvatar = document.getElementById('userAvatar');
    const welcomeName = document.getElementById('welcomeName');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Обновляем информацию пользователя
    updateUserInfo();
    
    // Переключение боковой панели
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }
    
    // Обработка чекбоксов задач
    document.querySelectorAll('.task-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const taskItem = this.closest('.task-item');
            
            if (this.checked) {
                taskItem.style.opacity = '0.6';
                
                // Добавляем XP за выполнение задачи
                if (currentUser.role === 'student') {
                    auth.addXP(currentUser.id, 50, 'Выполнение задачи');
                    
                    // Показываем уведомление
                    showNotification('+50 XP за выполнение задачи!', 'success');
                    
                    // Обновляем XP в интерфейсе
                    updateXPDisplay();
                }
            } else {
                taskItem.style.opacity = '1';
            }
        });
    });
    
    // Обработка кнопки выхода
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('Вы уверены, что хотите выйти из системы?')) {
                const result = auth.logout();
                
                if (result.success) {
                    showNotification('Выход выполнен успешно', 'info');
                    
                    setTimeout(() => {
                        window.location.href = result.redirect;
                    }, 1000);
                }
            }
        });
    }
    
    // Инициализация графика
    if (progressChartCanvas) {
        initializeProgressChart();
    }
    
    // Демо-режим
    if (isDemo) {
        const demoBanner = document.createElement('div');
        demoBanner.className = 'demo-banner';
        demoBanner.innerHTML = `
            <div style="background: #F59E0B; color: white; padding: 10px 20px; text-align: center;">
                <i class="fas fa-info-circle"></i>
                <span>Демо-режим. Данные не сохраняются.</span>
                <a href="login.html" style="color: white; margin-left: 20px;">Войти в реальный аккаунт</a>
            </div>
        `;
        document.querySelector('.main-content').prepend(demoBanner);
    }
    
    // Функция обновления информации пользователя
    function updateUserInfo() {
        if (userNameElement) {
            userNameElement.textContent = currentUser.name;
        }
        
        if (userRoleElement) {
            const roleNames = {
                'student': 'Ученик',
                'mentor': 'Ментор',
                'parent': 'Родитель'
            };
            
            const roleText = roleNames[currentUser.role] || currentUser.role;
            const levelText = currentUser.level ? ` • Уровень ${currentUser.level}` : '';
            userRoleElement.textContent = `${roleText}${levelText}`;
        }
        
        if (userAvatar && currentUser.avatar) {
            userAvatar.src = currentUser.avatar;
        }
        
        if (welcomeName) {
            welcomeName.textContent = currentUser.name.split(' ')[0];
        }
        
        // Обновляем XP в боковой панели
        updateXPDisplay();
    }
    
    // Функция обновления отображения XP
    function updateXPDisplay() {
        const xpFill = document.querySelector('.xp-fill');
        const xpNumbers = document.querySelector('.xp-info');
        const xpText = document.querySelector('.xp-progress p');
        
        if (xpFill && currentUser.xp !== undefined) {
            const nextLevelXP = 300 * (currentUser.level || 1);
            const percentage = Math.min((currentUser.xp / nextLevelXP) * 100, 100);
            xpFill.style.width = `${percentage}%`;
        }
        
        if (xpNumbers) {
            const nextLevelXP = 300 * (currentUser.level || 1);
            xpNumbers.innerHTML = `
                <small>${currentUser.xp || 0} XP</small>
                <small>${nextLevelXP} XP</small>
            `;
        }
        
        if (xpText) {
            const nextLevelXP = 300 * (currentUser.level || 1);
            const remainingXP = Math.max(0, nextLevelXP - (currentUser.xp || 0));
            xpText.innerHTML = `До следующего уровня: <strong>${remainingXP} XP</strong>`;
        }
    }
    
    // Инициализация графика прогресса
    function initializeProgressChart() {
        const ctx = progressChartCanvas.getContext('2d');
        
        const data = {
            labels: ['Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев'],
            datasets: [{
                label: 'Прогресс поступления',
                data: [25, 40, 65, currentUser.progress || 0, 90, 95],
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderColor: '#2563EB',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        };
        
        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        };
        
        new Chart(ctx, config);
    }
    
    // Функция показа уведомлений
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        
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
            <div style="background-color: ${bgColor}; color: white; padding: 1rem 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
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
        `;
        
        document.body.appendChild(notification);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
});