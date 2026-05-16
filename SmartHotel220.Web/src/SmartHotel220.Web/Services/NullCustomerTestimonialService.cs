using System;

namespace SmartHotel220.Web.Services
{
    /// <inheritdoc />
    /// <summary>
    /// Нулевая рекомендация. Задаётся по умолчанию в стартапе
    /// </summary>
    public class NullCustomerTestimonialService : ICustomerTestimonialService
    {
        public CustomerTestimonial GetTestimonial()
        {
            throw new CustomerTestimonialServiceNotConfiguredException();
        }
    }
    
    /// <inheritdoc />
    /// <summary>
    /// Исключение на тот случай, если возникли проблемы с конфигурацией сервиса рекомендаций
    /// </summary>
    public class CustomerTestimonialServiceNotConfiguredException : ApplicationException
    {
        public CustomerTestimonialServiceNotConfiguredException() 
            : base("Нет настройки службы отзывов клиентов")
        {
        }
    }
}
