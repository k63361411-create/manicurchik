// === supabase-config.js ===
const SUPABASE_URL = 'https://rbbdisiqhhxdrqtklpnt.supabase.co '; // ЗАМЕНИТЕ!
const SUPABASE_KEY = 'sb_secret_7g9X0kzlhhRqY_PDTwUe5Q_3lO_MHCg'; // ЗАМЕНИТЕ!

// Создаем клиент Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Экспорт для использования в других файлах
window.supabaseClient = supabase;