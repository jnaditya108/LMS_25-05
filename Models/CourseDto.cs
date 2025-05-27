// File: EduSyncAPI/Models/CourseDto.cs
using System;

namespace EduSyncAPI.Models
{
    public class CourseDto // This DTO represents the Course information you want to expose
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int InstructorId { get; set; }
        public string InstructorUsername { get; set; } // To display instructor's name

        public string? VideoUrl { get; set; } // NEW
        public string? ThumbnailUrl { get; set; } // NEW
        public string? ModulePdfUrl { get; set; } // NEW: PDF Module URL
        public DateTime EnrollmentDate { get; set; }
    }
}