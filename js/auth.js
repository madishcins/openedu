// Система аутентификации OpenEdu Nexus
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }
    
    init() {
        // Проверяем существующую сессию
        const savedUser = localStorage.getItem('openEduUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }
    
    // Загрузка пользователей
    loadUsers() {
        const defaultUsers = [
            {
                id: 1,
                email: 'student@example.com',
                password: 'student123',
                name: 'Айжан Нургалиева',
                role: 'student',
                level: 12,
                xp: 2540,
                university: 'University of Cambridge',
                progress: 87,
                avatar: 'https://i.pravatar.cc/150?img=32'
            },
            {
                id: 2,
                email: 'mentor@example.com',
                password: 'mentor123',
                name: 'Алия Смагулова',
                role: 'mentor',
                specialization: 'Поступление в UK',
                avatar: 'https://i.pravatar.cc/150?img=8'
            },
            {
                id: 3,
                email: 'parent@example.com',
                password: 'parent123',
                name: 'Родители Нургалиевы',
                role: 'parent',
                avatar: 'https://i.pravatar.cc/150?img=45'
            }
        ];
        
        // Загружаем из localStorage или создаем по умолчанию
        const storedUsers = localStorage.getItem('openEduUsers');
        return storedUsers ? JSON.parse(storedUsers) : defaultUsers;
    }
    
    // Сохранение пользователей
    saveUsers() {
        localStorage.setItem('openEduUsers', JSON.stringify(this.users));
    }
    
    // Регистрация нового пользователя
    register(userData) {
        // Проверяем, нет ли уже такого email
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Пользователь с таким email уже существует' };
        }
        
        const newUser = {
            id: Date.now(),
            ...userData,
            level: 1,
            xp: 0,
            progress: 0,
            createdAt: new Date().toISOString(),
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
        };
        
        this.users.push(newUser);
        this.saveUsers();
        
        // Автоматически логинимся после регистрации
        return this.login(userData.email, userData.password);
    }
    
    // Вход в систему
    login(email, password) {
        const user = this.users.find(u => 
            u.email === email && u.password === password
        );
        
        if (user) {
            // Убираем пароль из сохраненных данных
            const { password: _, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;
            
            // Сохраняем сессию
            localStorage.setItem('openEduUser', JSON.stringify(userWithoutPassword));
            localStorage.setItem('isLoggedIn', 'true');
            
            return { 
                success: true, 
                user: userWithoutPassword,
                redirect: 'dashboard.html'
            };
        }
        
        return { success: false, message: 'Неверный email или пароль' };
    }
    
    // Выход из системы
    logout() {
        this.currentUser = null;
        localStorage.removeItem('openEduUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isDemo');
        return { success: true, redirect: 'index.html' };
    }
    
    // Обновление данных пользователя
    updateUser(userId, updates) {
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...updates };
            this.saveUsers();
            
            // Обновляем текущую сессию если это текущий пользователь
            if (this.currentUser && this.currentUser.id === userId) {
                this.currentUser = { ...this.currentUser, ...updates };
                localStorage.setItem('openEduUser', JSON.stringify(this.currentUser));
            }
            
            return { success: true, user: this.users[index] };
        }
        return { success: false, message: 'Пользователь не найден' };
    }
    
    // Добавление XP пользователю
    addXP(userId, xpAmount, reason) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return { success: false };
        
        const oldXP = user.xp || 0;
        const newXP = oldXP + xpAmount;
        const oldLevel = user.level || 1;
        const newLevel = Math.floor(newXP / 300) + 1;
        
        const updateData = { xp: newXP, level: newLevel };
        
        // Добавляем достижение
        if (reason) {
            updateData.lastAchievement = {
                reason,
                xp: xpAmount,
                date: new Date().toISOString()
            };
        }
        
        const result = this.updateUser(userId, updateData);
        
        // Проверяем, повысился ли уровень
        if (newLevel > oldLevel) {
            console.log(`Пользователь ${userId} достиг уровня ${newLevel}!`);
        }
        
        return result;
    }
    
    // Получение всех пользователей по роли
    getUsersByRole(role) {
        return this.users.filter(u => u.role === role);
    }
    
    // Поиск пользователя по ID
    getUserById(id) {
        return this.users.find(u => u.id === id);
    }
    
    // Проверка авторизации
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    // Получение текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }
}

// Создаем глобальный экземпляр
const auth = new AuthSystem();