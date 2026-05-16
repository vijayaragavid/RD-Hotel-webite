using System;
using Newtonsoft.Json;

namespace SmartHotel220.Web.Models
{
    /// <summary>
    /// Документ питомца. Модель для API работы с хранилищем
    /// </summary>
    public class PetDocument
    {
        [JsonProperty(PropertyName = "id")]
        public Guid Id { get; set; }

        /// <summary>
        /// Имя питомца
        /// </summary>
        public string PetName { get; set; }

        /// <summary>
        /// URL картинки
        /// </summary>
        public string MediaUrl { get; set; }

        /// <summary>
        /// Одобрено или нет
        /// </summary>
        public bool? IsApproved { get; set; }
        
        /// <summary>
        /// Дата создания
        /// </summary>
        public DateTime Created { get; set; }

        /// <summary>
        /// Сообщение
        /// </summary>
        public string Message { get; set; }
    }
}
