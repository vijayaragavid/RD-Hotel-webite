using System;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;
using SmartHotel220.Web.Models.Settings;

namespace SmartHotel220.Web.Services
{
    /// <summary>
    /// Сервис опперирует настройками
    /// </summary>
    public class SettingsService
    {
        /// <summary>
        /// Серверные настройки
        /// </summary>
        public ServerSettings GlobalSettings { get; }
        /// <summary>
        /// Локальные настройки
        /// </summary>
        public LocalSettings LocalSettings { get; set; }

        private SettingsService(ServerSettings settings, LocalSettings localSettings)
        {
            GlobalSettings = settings;
            LocalSettings = localSettings;
        }

        /// <summary>
        /// Загрузка настроек по средствам http запроса
        /// </summary>
        /// <param name="localSettings">Локальные настройки</param>
        /// <returns>Сервис/служба настроек</returns>
        public static SettingsService Load(LocalSettings localSettings)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    using (var response = client.GetAsync(new Uri(localSettings.SettingsUrl)).Result)
                    {
                        response.EnsureSuccessStatusCode();

                        var responseBody = response.Content.ReadAsStringAsync().Result;
                        var model = JsonConvert.DeserializeObject<ServerSettings>(responseBody);
                        model.Production = localSettings.Production;

                        return new SettingsService(model, localSettings);
                    } // using
                } // using
            }
            catch (Exception)
            {
                var model = new ServerSettings
                {
                    Production = localSettings.Production
                };

                return new SettingsService(model, localSettings);
            } // try-catch
        } // Load
    } // SettingsService
}