// File: EduSyncAPI/Models/AssessmentDto.cs

using System;
using System.Collections.Generic; // Potentially needed if you include collections like Questions later

namespace EduSyncAPI.Models
{
    public class AssessmentDto // This DTO represents the Assessment information you want to expose
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public int CourseId { get; set; } // Keep the foreign key ID

        // Include the Course as a DTO (CourseDto), not the full EF Course entity.
        // This is how you provide Course details without creating a cycle.
        public CourseDto Course { get; set; }

        // If you later want to include simplified Question data, you would add:
        // public ICollection<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
        // But for now, let's just focus on fixing the Course cycle.
    }
}