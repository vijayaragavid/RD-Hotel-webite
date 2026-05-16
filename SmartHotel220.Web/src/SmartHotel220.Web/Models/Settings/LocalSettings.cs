namespace SmartHotel220.Web.Models.Settings
{
    /// <summary>
    /// Локальные настройки
    /// </summary>
    public class LocalSettings
    {
        public LocalSettings()
        {
            PetsConfig = new PetsConfig();
        }

        /// <summary>
        /// В продакшине или нет
        /// </summary>
        public bool Production { get; set; }

        /// <summary>
        /// URL к файлу JSON с настройками. Этот конфиг может быть где угодно
        /// </summary>
        public string SettingsUrl { get; set; }

        /// <summary>
        /// Конфиг для работы с питомцами
        /// </summary>
        public PetsConfig PetsConfig { get; set; }
    }
}
