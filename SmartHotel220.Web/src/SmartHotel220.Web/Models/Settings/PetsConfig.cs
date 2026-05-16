namespace SmartHotel220.Web.Models.Settings
{
    /// <summary>
    /// Для более удобной работы с питомцами
    /// </summary>
    public class PetsConfig
    {
        /// <summary>
        /// URI CosmosDb
        /// </summary>
        public string CosmosUri { get; set; }

        /// <summary>
        /// Ключ CosmosDb
        /// </summary>
        public string CosmosKey { get; set; }

        /// <summary>
        /// Название BLOB-поля
        /// </summary>
        public string BlobName { get; set; }

        /// <summary>
        /// Ключ BLOB-поля
        /// </summary>
        public string BlobKey { get; set; }
    }
}
