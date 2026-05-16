namespace SmartHotel220.Web.Models.Settings
{
    /// <summary>
    /// Azure Active Directory B2C
    /// </summary>
    public class B2c
    {
        public string Tenant { get; set; }
        public string Client { get; set; }
        public string Policy { get; set; }
    }
}
