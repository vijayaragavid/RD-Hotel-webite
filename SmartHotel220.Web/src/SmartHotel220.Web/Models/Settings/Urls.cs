namespace SmartHotel220.Web.Models.Settings
{
    /// <summary>
    /// Ссылки к API
    /// </summary>
    public class Urls
    {
        /// <summary>
        /// Отели
        /// </summary>
        public string Hotels { get; set; }

        /// <summary>
        /// Бронирования
        /// </summary>
        public string Bookings { get; set; }

        /// <summary>
        /// Предложения
        /// </summary>
        public string Suggestions { get; set; }

        /// <summary>
        /// Задачи (запросить полотенца, сообщить об утечке)
        /// </summary>
        public string Tasks { get; set; }

        /// <summary>
        /// База с картинками
        /// </summary>
        public string Images_Base { get; set; }

        /// <summary>
        /// Отзывы
        /// </summary>
        public string Reviews { get; set; }
    }
}
