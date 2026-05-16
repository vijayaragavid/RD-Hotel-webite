using Microsoft.AspNetCore.Mvc;
using SmartHotel220.Web.Services;

namespace SmartHotel220.Web.Controllers
{
    /// <inheritdoc />
    /// <summary>
    /// Контроллирует API рекомендаций
    /// </summary>
    [Route("api/testimonials")]
    public class TestimonialsApiController : Controller
    {
        private readonly ICustomerTestimonialService _testimonialService;

        public TestimonialsApiController(ICustomerTestimonialService testimonialService)
        {
            _testimonialService = testimonialService;
        }

        [HttpGet]
        public IActionResult Index()
        {
            var testimonial = _testimonialService.GetTestimonial();

            return Json(testimonial);
        }
    }
}
