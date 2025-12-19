// Логика главной страницы
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.querySelector('.nav-menu');
    const demoRequestForm = document.getElementById('demoRequestForm');
    
    // Мобильное меню
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });
    }
    
    // Обработка демо-формы
    if (demoRequestForm) {
        demoRequestForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                role: document.getElementById('role').value,
                agreement: document.getElementById('agreement').checked
            };
            
            // Валидация
            if (!formData.name || !formData.email || !formData.agreement) {
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
                return;
            }
            
            // Сохраняем данные
            localStorage.setItem('demoRequest', JSON.stringify(formData));
            
            // Показать уведомление об успехе
            showNotification('Заявка принята! Мы свяжемся с вами в течение 24 часов.', 'success');
            
            // Очистка формы
            demoRequestForm.reset();
        });
    }
    
    // Функция показа уведомлений
    function showNotification(message, type = 'success') {
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