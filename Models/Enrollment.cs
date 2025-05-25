namespace EduSyncAPI.Models
{
	public class Enrollment
	{
		public int Id { get; set; }
		public int UserId { get; set; }  // Student
		public int CourseId { get; set; }

		// Navigation properties (optional)
		public User? User { get; set; }
		public Course? Course { get; set; }
	}
}
