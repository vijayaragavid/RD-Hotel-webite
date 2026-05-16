namespace SmartHotel220.Web.Services
{
    /// <summary>
    /// Интерфейс рекомендации
    /// </summary>
    public interface ICustomerTestimonialService
    {
        CustomerTestimonial GetTestimonial();
    }

    /// <summary>
    /// Клиентская рекомендация
    /// </summary>
    public class CustomerTestimonial
    {
        public string CustomerName { get; set; }
        public string Text { get; set; }
    }
}
