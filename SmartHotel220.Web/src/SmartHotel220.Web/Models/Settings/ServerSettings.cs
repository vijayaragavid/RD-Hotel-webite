namespace SmartHotel220.Web.Models.Settings
{
    /// <summary>
    /// Серверные настройки (хранятся на сервере)
    /// </summary>
    public class ServerSettings
    {
        /// <summary>
        /// В продакшине или нет
        /// </summary>
        public bool Production { get; set; }

        /// <summary>
        /// Ссылки к API
        /// </summary>
        public Urls Urls { get; set; }

        /// <summary>
        /// Токены (например к картам Google или Bing)
        /// </summary>
        public Tokens Tokens { get; set; }

        /// <summary>
        /// Azure Active Directory B2C
        /// </summary>
        public B2c B2c { get; set; }
    }
}
