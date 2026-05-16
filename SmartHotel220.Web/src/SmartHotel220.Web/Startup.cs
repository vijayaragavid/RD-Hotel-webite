using Microsoft.ApplicationInsights.AspNetCore;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.ApplicationInsights.SnapshotCollector;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using SmartHotel220.Web.Models.Settings;
using SmartHotel220.Web.Services;

namespace SmartHotel220.Web
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        // Этот метод вызывается во время выполнения. Используется для добавления сервисов в контейнер зависимостей.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            // Регистрируем локальный конфиг с настройками
            services.Configure<LocalSettings>(Configuration);
            // Загружаем настройки с сервера
            services.AddSingleton(sp => SettingsService.Load(sp.GetService<IOptions<LocalSettings>>().Value));
            // Телеметрия ApplicationInsights
            services.AddSingleton<ITelemetryProcessorFactory>(new SnapshotCollectorTelemetryProcessorFactory());

            // Кастомные сервисы
            if (!string.IsNullOrEmpty(Configuration["USE_NULL_TESTIMONIALS_SERVICE"])) {
                services.AddSingleton<ICustomerTestimonialService>(new NullCustomerTestimonialService());
            } else {
                services.AddSingleton<ICustomerTestimonialService, PositiveTweetService>();
            }
        }

        // Этот метод вызывается во время выполнения. Используйте этот метод для настройки конвейера HTTP-запросов.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions {
                    HotModuleReplacement = true,
                    ReactHotModuleReplacement = true
                });
            } else {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseMvc(routes => {
                routes.MapRoute(
                    "default",
                    "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    "spa-fallback",
                    new { controller = "Home", action = "Index" });
            });
        }

        // Телеметрия ApplicationInsights
        private class SnapshotCollectorTelemetryProcessorFactory : ITelemetryProcessorFactory
        {
            public ITelemetryProcessor Create(ITelemetryProcessor next) =>
                new SnapshotCollectorTelemetryProcessor(next);
        }
    }
}
