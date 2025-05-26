// EduSyncAPI/Models/UpdateAssessmentDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPI.Models
{
    public class UpdateAssessmentDto
    {
        // Include Id for the entity being updated
        public int Id { get; set; }

        // IMPORTANT: Only include CourseId, not the full Course object
        [Required(ErrorMessage = "Course ID is required.")]
        public int CourseId { get; set; }

        public int UserId { get; set; }

        [Required(ErrorMessage = "Title is required")]
        public string Title { get; set; } = string.Empty;

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = string.Empty;

        [Required(ErrorMessage = "Start Date is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End Date is required.")]
        public DateTime EndDate { get; set; }

        // You might also want to add properties for questions if you manage them directly via the assessment update
        // public ICollection<QuestionDto> Questions { get; set; } // If you handle question updates via assessment PUT
    }
}