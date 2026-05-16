// Настройки на TS
class Settings {

    public production = false;

    public urls = {
        hotels: '',
        bookings: '',
        suggestions: '',
        tasks: '',
        images_Base: '',
        reviews: ''
    }

    public tokens = {
        bingmaps: ''
    }

    public b2c = {
        tenant: '',
        client: '',
        policy: ''
    }
}

declare global {
    interface Window {
        settings: Settings;
    }
}
//export var encoder = new TextEncoder('iso-8859-1');
//export var decoder = new TextDecoder('utf-8');
let clientSettings = new Settings();

// Получаем настройки из window.settings
if (window.settings) {
    clientSettings = { ...clientSettings, ...window.settings }
}

// Экспортируем для дальнейшей работы в других файлах
export let settings = clientSettings;