// === auth.js ===
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.userData = null;
        this.init();
    }

    async init() {
        // Проверяем текущую сессию
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (session) {
            this.currentUser = session.user;
            await this.loadUserData(this.currentUser.id);
        }
        
        this.updateUI();
        
        // Слушаем изменения авторизации
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                await this.loadUserData(this.currentUser.id);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.userRole = null;
                this.userData = null;
                localStorage.removeItem('userData');
            }
            this.updateUI();
        });
    }

    async loadUserData(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (data) {
                this.userData = data;
                this.userRole = data.role;
                
                // Сохраняем в localStorage
                localStorage.setItem('userData', JSON.stringify({
                    id: userId,
                    email: this.currentUser.email,
                    role: this.userRole,
                    ...data
                }));
            } else {
                // Если пользователя нет в таблице users, создаем
                await this.createUserProfile(userId);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    }

    async createUserProfile(userId) {
        const { data, error } = await supabaseClient
            .from('users')
            .insert([{
                id: userId,
                email: this.currentUser.email,
                role: 'client',
                first_name: '',
                last_name: '',
                created_at: new Date().toISOString()
            }]);
        
        if (error) {
            console.error('Ошибка создания профиля:', error);
        } else {
            this.userRole = 'client';
        }
    }

    // РЕГИСТРАЦИЯ
    async register(email, password, userData = {}) {
        try {
            // Регистрируем в Supabase Auth
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        phone: userData.phone
                    }
                }
            });
            
            if (error) throw error;
            
            // Создаем запись в таблице users
            const { error: profileError } = await supabaseClient
                .from('users')
                .insert([{
                    id: data.user.id,
                    email: email,
                    role: userData.role || 'client',
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    phone: userData.phone
                }]);
            
            if (profileError) throw profileError;
            
            return { success: true, message: 'Регистрация успешна! Проверьте email для подтверждения.' };
        } catch (error) {
            let message = 'Ошибка регистрации';
            
            if (error.message.includes('already registered')) {
                message = 'Этот email уже зарегистрирован';
            } else if (error.message.includes('weak password')) {
                message = 'Пароль слишком слабый (минимум 6 символов)';
            }
            
            return { success: false, message: message };
        }
    }

    // ВХОД
    async login(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            let message = 'Ошибка входа';
            
            if (error.message.includes('Invalid login credentials')) {
                message = 'Неверный email или пароль';
            }
            
            return { success: false, message: message };
        }
    }

    // ВЫХОД
    async logout() {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    }

    // ОБНОВЛЕНИЕ UI
    updateUI() {
        const authNav = document.getElementById('authNav');
        const mobileAuthNav = document.getElementById('mobileAuthNav');
        
        if (!authNav) return;

        if (this.currentUser) {
            const userName = this.userData?.first_name || this.currentUser.email.split('@')[0];
            
            const userMenu = `
                <div class="user-menu">
                    <span class="user-greeting">Привет, ${userName}!</span>
                    <div class="dropdown">
                        <button class="dropdown-toggle">
                            <i class="fas fa-user-circle"></i>
                        </button>
                        <div class="dropdown-menu">
                            ${this.userRole === 'client' ? 
                                '<a href="client-dashboard.html" class="dropdown-item">Мой кабинет</a>' : ''}
                            ${this.userRole === 'master' ? 
                                '<a href="master-dashboard.html" class="dropdown-item">Кабинет мастера</a>' : ''}
                            ${this.userRole === 'admin' ? 
                                '<a href="admin-dashboard.html" class="dropdown-item">Панель админа</a>' : ''}
                            <div class="dropdown-divider"></div>
                            <button onclick="authSystem.logout()" class="dropdown-item">Выйти</button>
                        </div>
                    </div>
                </div>
            `;
            
            authNav.innerHTML = userMenu;
            if (mobileAuthNav) mobileAuthNav.innerHTML = userMenu;
        } else {
            const authButtons = `
                <button onclick="showLoginModal()" class="btn btn-secondary">Войти</button>
                <button onclick="showRegisterModal()" class="btn btn-primary">Регистрация</button>
            `;
            
            authNav.innerHTML = authButtons;
            if (mobileAuthNav) mobileAuthNav.innerHTML = authButtons;
        }
    }
}

// СОЗДАЕМ ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР
const authSystem = new AuthSystem();
window.authSystem = authSystem;