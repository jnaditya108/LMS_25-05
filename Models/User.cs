using System.ComponentModel.DataAnnotations;

namespace EduSyncAPI.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        public string Username { get; set; }
        
        [Required]
        public string Password { get; set; }  // Plain text password
        
        public string Email { get; set; }
        
        public string Role { get; set; } = "Student";  // Default role
        
        // Navigation properties
        public virtual ICollection<Course> Courses { get; set; }
        public virtual ICollection<Enrollment> Enrollments { get; set; }
    }
}