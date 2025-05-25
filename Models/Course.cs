// EduSyncAPI/Models/Course.cs (REPLACE this file's content)

using System.Collections.Generic; // Required for ICollection
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace EduSyncAPI.Models
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int InstructorId { get; set; }

        [JsonIgnore]
        [ValidateNever] // This tells model validation to ignore this property
        public User Instructor { get; set; }

        // --- NEW: Navigation properties for Assessments and Enrollments ---
        // This indicates that a Course can have many Assessments
        public ICollection<Assessment> Assessments { get; set; } = new List<Assessment>();

        // This indicates that a Course can have many Enrollments
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        // -----------------------------------------------------------------
    }
}