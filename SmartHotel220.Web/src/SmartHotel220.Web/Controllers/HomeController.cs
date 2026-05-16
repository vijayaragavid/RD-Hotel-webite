using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SmartHotel220.Web.Models.Settings;
using SmartHotel220.Web.Services;

namespace SmartHotel220.Web.Controllers
{
    /// <inheritdoc />
    /// <summary>
    /// Одна единственная главная страница
    /// </summary>
    public class HomeController : Controller
    {
        private readonly ServerSettings _globalSettings;

        public HomeController(SettingsService settingsService)
        {
            _globalSettings = settingsService.GlobalSettings;
        }

        // Передаём глобальные настройки полученные от сервера при запуске
        public IActionResult Index()
        {
            return View(_globalSettings);
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}