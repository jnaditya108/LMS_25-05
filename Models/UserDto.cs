// EduSyncAPI/Models/UserDto.cs
// This DTO is used to expose student details without sensitive information

namespace EduSyncAPI.Models
{
	public class UserDto
	{
		public int Id { get; set; }
		public string Username { get; set; }
		public string Email { get; set; }
		public string Role { get; set; } // e.g., "Student", "Educator"
		public DateTime? EnrollmentDate { get; set; } // Optional enrollment date for student views
	}
}