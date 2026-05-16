using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.ProjectOxford.Vision;

namespace PetCheckerFunction
{
    public static class PetChecker
    {
        /// <summary>
        /// Функция Azure для проверки питомца когнитивным сервисом Azure
        /// </summary>
        [FunctionName("PetChecker")]
        public static async Task RunPetChecker([CosmosDBTrigger("pets", 
                                                   "checks", 
                                                   ConnectionStringSetting = "constr", 
                                                   CreateLeaseCollectionIfNotExists = true)]
                                               IReadOnlyList<Document> document,
                                               TraceWriter log)
        {
            // Проходим по документам
            foreach (dynamic doc in document) {
                var isProcessed = doc.IsApproved != null;
                // Если одобрено, то continue
                if (isProcessed) {
                    continue;
                }

                // URL работы функции (само изображение)
                var url = doc.MediaUrl;
                // Время загрузки
                var uploaded = (DateTime)doc.Created;

                log.Info($">>> Обработка изображения в {url} загруженного в {uploaded.ToString()}");

                using (var httpClient = new HttpClient()) {
                    // Результат
                    var res = await httpClient.GetAsync(url);
                    // Поток
                    var stream = await res.Content.ReadAsStreamAsync() as Stream;

                    log.Info("--- Изображение успешно загружено из хранилища");

                    // Анализируем изображение
                    var (allowed, message) = await PassesImageModerationAsync(stream, log);

                    log.Info($"--- Изображение проанализировано. Это было {(allowed ? string.Empty : "НЕ")} одобрено");

                    // Формируем документ
                    doc.IsApproved = allowed;
                    doc.Message = message;

                    log.Info("--- Обновление документа CosmosDb с историческими данными");

                    // Загружаем документ в CosmosDb
                    await UpsertDocument(doc, log);

                    log.Info($"<<< Изображение в {url} обработано!");
                } // using
            } // foreach
        } // RunPetChecker

        /// <summary>
        /// Загрузка документа
        /// </summary>
        private static async Task UpsertDocument(dynamic doc, TraceWriter log)
        {
            // URI
            var endpoint = Environment.GetEnvironmentVariable("cosmos_uri");
            // Ключ
            var auth = Environment.GetEnvironmentVariable("cosmos_key");
            // Выполняем вход
            var client = new DocumentClient(new Uri(endpoint), auth);

            const string dbName = "pets";
            const string colName = "checks";

            doc.Analyzed = DateTime.Now;

            // Загрузка документа в космическую базу
            await client.UpsertDocumentAsync(UriFactory.CreateDocumentCollectionUri(dbName, colName), doc);

            log.Info("--- Обновлен документ CosmosDb.");
        } // UpsertDocument

        /// <summary>
        /// Анализ изображения
        /// </summary>
        public static async Task<(bool, string)> PassesImageModerationAsync(Stream image, TraceWriter log)
        {
            log.Info("--- Создание клиента VisionApi и анализ изображения");

            // Ключ
            var key = Environment.GetEnvironmentVariable("MicrosoftVisionApiKey");
            // Конечная точка Vision API
            var endpoint = Environment.GetEnvironmentVariable("MicrosoftVisionApiEndpoint");
            // Создаём клиент
            var client = new VisionServiceClient(key, endpoint);
            // Выбираем Description - описание картинки
            var features = new[] { VisualFeature.Description };
            // Запускаем анализ картинки
            var result = await client.AnalyzeImageAsync(image, features);

            log.Info($"--- Изображение проанализировано c тэгами: {string.Join(",", result.Description.Tags)}");

            // Тэги для извлечения
            if (!int.TryParse(Environment.GetEnvironmentVariable("MicrosoftVisionNumTags"), out var tagsToFetch)) {
                tagsToFetch = 5;
            }

            // Анализируем результат. Если есть "dog" в описании значит картинка нам подходит
            var isAllowed = result.Description.Tags.Take(tagsToFetch).Contains("dog");
            var message = result.Description?.Captions.FirstOrDefault()?.Text;

            return (isAllowed, message);
        } // PassesImageModerationAsync
    } // PetChecker
}