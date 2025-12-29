// === main.js ===
// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    loadMasters();
    loadPortfolio();
    loadReviews();
});

// ЗАГРУЗКА УСЛУГ
async function loadServices() {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    try {
        const services = await database.loadServices();
        
        if (services.length === 0) {
            servicesGrid.innerHTML = '<p>Услуги временно недоступны</p>';
            return;
        }

        let html = '';
        services.forEach(service => {
            html += `
                <div class="service-card">
                    <div class="service-icon">
                        <i class="fas fa-spa"></i>
                    </div>
                    <h3>${service.name}</h3>
                    <p>${service.description || ''}</p>
                    <div class="service-price">${service.price} руб.</div>
                    <div class="service-time">${service.duration || 60} мин.</div>
                    <button onclick="bookService('${service.id}')" class="btn btn-service">Записаться</button>
                </div>
            `;
        });

        servicesGrid.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
        servicesGrid.innerHTML = '<p>Ошибка загрузки услуг</p>';
    }
}

// ЗАГРУЗКА МАСТЕРОВ
async function loadMasters() {
    const mastersGrid = document.getElementById('mastersGrid');
    if (!mastersGrid) return;

    try {
        const masters = await database.loadMasters();
        
        if (masters.length === 0) {
            mastersGrid.innerHTML = '<p>Мастера временно недоступны</p>';
            return;
        }

        let html = '';
        masters.forEach(master => {
            const ratingStars = '★'.repeat(Math.round(master.rating || 5)) + 
                              '☆'.repeat(5 - Math.round(master.rating || 5));
            
            html += `
                <div class="master-card">
                    <div class="master-avatar">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div class="master-info">
                        <h3>${master.first_name || 'Мастер'} ${master.last_name || ''}</h3>
                        <div class="master-rating" title="${master.rating || 5} из 5">
                            ${ratingStars}
                        </div>
                        <p>${master.specialization || 'Маникюр, педикюр'}</p>
                        <p>Опыт: ${master.experience || 1}+ лет</p>
                        <button onclick="bookWithMaster('${master.id}')" class="btn btn-primary">Записаться</button>
                    </div>
                </div>
            `;
        });

        mastersGrid.innerHTML = html;
    } catch (error) {
        console.error('Ошибка загрузки мастеров:', error);
        mastersGrid.innerHTML = '<p>Ошибка загрузки мастеров</p>';
    }
}