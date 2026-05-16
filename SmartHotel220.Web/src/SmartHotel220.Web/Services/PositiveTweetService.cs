using Microsoft.Extensions.Options;
using SmartHotel220.Web.Models.Settings;

namespace SmartHotel220.Web.Services
{
    /// <inheritdoc />
    /// <summary>
    /// Фейковая позитивная рекомендация якобы из твиттера
    /// </summary>
    public class PositiveTweetService : ICustomerTestimonialService
    {
        private IOptions<LocalSettings> _localSettings;

        public PositiveTweetService(IOptions<LocalSettings> localSettings)
        {
            _localSettings = localSettings;
        }

        public CustomerTestimonial GetTestimonial()
        {
            var model = new CustomerTestimonial
            {
                CustomerName = "Алексей Бурьянов",
                Text = "Этот отель является супер-высокотехнологичным! Рекомендую его всем!"
            }; 

            return model;            
        }
    }
}
