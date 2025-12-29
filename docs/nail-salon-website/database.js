// === database.js ===
class Database {
    // ЗАГРУЗКА УСЛУГ
    async loadServices() {
        try {
            const { data, error } = await supabaseClient
                .from('services')
                .select('*')
                .eq('active', true);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Ошибка загрузки услуг:', error);
            return [];
        }
    }

    // ЗАГРУЗКА МАСТЕРОВ
    async loadMasters() {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('role', 'master');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Ошибка загрузки мастеров:', error);
            return [];
        }
    }

    // ЗАГРУЗКА ПОРТФОЛИО
    async loadPortfolio(limit = 6) {
        try {
            const { data, error } = await supabaseClient
                .from('portfolio')
                .select('*, users(first_name, last_name)')
                .eq('approved', true)
                .order('created_at', { ascending: false })
                .limit(limit);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Ошибка загрузки портфолио:', error);
            return [];
        }
    }

    // СОЗДАНИЕ ЗАПИСИ
    async createAppointment(appointmentData) {
        try {
            const { data, error } = await supabaseClient
                .from('appointments')
                .insert([appointmentData]);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Ошибка создания записи:', error);
            return { success: false, message: error.message };
        }
    }

    // ЗАГРУЗКА ЗАПИСЕЙ КЛИЕНТА
    async loadClientAppointments(clientId) {
        try {
            const { data, error } = await supabaseClient
                .from('appointments')
                .select(`
                    *,
                    services(name, price),
                    users:master_id(first_name, last_name)
                `)
                .eq('client_id', clientId)
                .gte('date', new Date().toISOString().split('T')[0])
                .order('date')
                .order('time');
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            return [];
        }
    }

    // ЗАГРУЗКА РАСПИСАНИЯ МАСТЕРА
    async loadMasterSchedule(masterId) {
        try {
            const { data, error } = await supabaseClient
                .from('master_schedule')
                .select('*')
                .eq('master_id', masterId);
            
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Ошибка загрузки расписания:', error);
            return [];
        }
    }

    // ОБНОВЛЕНИЕ ПРОФИЛЯ
    async updateUserProfile(userId, profileData) {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .update(profileData)
                .eq('id', userId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Ошибка обновления профиля:', error);
            return { success: false, message: error.message };
        }
    }
}

// СОЗДАЕМ ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР
const database = new Database();
window.database = database;