using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using SmartHotel220.Web.Models;
using SmartHotel220.Web.Services;

namespace SmartHotel220.Web.Controllers
{
    /// <summary>
    /// Данные для запроса
    /// </summary>
    public class PetUploadRequest
    {
        /// <summary>
        /// Данные в формате строки base64
        /// </summary>
        public string Base64 { get; set; }

        /// <summary>
        /// Название
        /// </summary>
        public string Name { get; set; }
    }

    /// <inheritdoc />
    /// <summary>
    /// API для питомцев
    /// </summary>
    [Route("api/pets")]
    public class PetsApiController : Controller
    {
        private readonly SettingsService _settingsSvc;
        // БД космос
        private const string DbName = "pets";
        // Коллекция
        private const string ColName = "checks";

        public PetsApiController(SettingsService settingsSvc)
        {
            _settingsSvc = settingsSvc;
        }

        /// <summary>
        /// Загрузка изображения питомца
        /// </summary>
        /// <param name="petRequest"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> UploadPetImageAsync([FromBody]PetUploadRequest petRequest)
        {
            // Проверка на плохой запрос
            if (string.IsNullOrEmpty(petRequest?.Base64)) {
                return BadRequest();
            }

            var tokens = petRequest.Base64.Split(',');
            //var ctype = tokens[0].Replace("data:", "");
            var base64 = tokens[1];
            // Получаем байты из base64
            var content = Convert.FromBase64String(base64);

            // Загрузка байт в хранилище
            var blobUri = await UploadPetToStorageAsync(content);

            // Затем создаём документ в CosmosDb, чтобы уведомить нашу функцию
            var identifier = await UploadDocumentAsync(blobUri, petRequest.Name ?? "Bars");

            return Ok(identifier);
        }

        /// <summary>
        /// Загрузка документа
        /// </summary>
        /// <param name="uri">URI BLOB-хранилища</param>
        /// <param name="petName">Имя питомца</param>
        private async Task<Guid> UploadDocumentAsync(Uri uri, string petName)
        {
            // Конечная точка cosmosDb
            var endpoint = new Uri(_settingsSvc.LocalSettings.PetsConfig.CosmosUri);
            // Ключ
            var auth = _settingsSvc.LocalSettings.PetsConfig.CosmosKey;
            // Выполняем вход
            var client = new DocumentClient(endpoint, auth);
            // Новый идентификатор
            var identifier = Guid.NewGuid();

            // Создаём БД
            await client.CreateDatabaseIfNotExistsAsync(new Database { Id = DbName });
            // Создаём коллекцию
            await client.CreateDocumentCollectionIfNotExistsAsync(UriFactory.CreateDatabaseUri(DbName), new DocumentCollection { Id = ColName });
            
            // Создаём документ
            await client.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(DbName, ColName),
                new PetDocument {
                    Id = identifier,
                    IsApproved = null,
                    PetName = petName,
                    MediaUrl = uri.ToString(),
                    Created = DateTime.Now
                });

            return identifier;
        }

        /// <summary>
        /// Загрузка питомца в хранилище
        /// </summary>
        private async Task<Uri> UploadPetToStorageAsync(byte[] content)
        {
            // Хранилище
            var storageName = _settingsSvc.LocalSettings.PetsConfig.BlobName;
            // Ключ
            var auth = _settingsSvc.LocalSettings.PetsConfig.BlobKey;
            // Загрузчик
            var uploader = new PhotoUploader(storageName, auth);
            // Загрузка
            var blob = await uploader.UploadPetPhotoAsync(content);

            return blob.Uri;
        }

        /// <summary>
        /// Проверяет состояние загрузки
        /// </summary>
        /// <param name="identifier">идентификатор документа</param>
        [HttpGet]
        public IActionResult GetUploadState(Guid identifier)
        {
            // Конечная точка cosmosDb
            var endpoint = new Uri(_settingsSvc.LocalSettings.PetsConfig.CosmosUri);
            // Ключ
            var auth = _settingsSvc.LocalSettings.PetsConfig.CosmosKey;
            // Выполняем вход
            var client = new DocumentClient(endpoint, auth);

            // URI коллекции
            var collectionUri = UriFactory.CreateDocumentCollectionUri(DbName, ColName);
            // Выполняем запрос к коллекции
            var query = client.CreateDocumentQuery<PetDocument>(collectionUri, new FeedOptions { MaxItemCount = 1 });

            // Фильтруем
            var docs = query.Where(x => x.Id == identifier)
                            .Where(x => x.IsApproved.HasValue)
                            .ToList();

            // Получаем документ
            var doc = docs.FirstOrDefault();

            return Ok(new {
                // Одобрено ли
                Approved = doc?.IsApproved ?? false,
                // Сообщение
                Message = doc?.Message ?? ""
            });
        } // GetUploadState
    }
}
