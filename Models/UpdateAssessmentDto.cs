// EduSyncAPI/Models/UpdateAssessmentDto.cs
using System;
using System.ComponentModel.DataAnnotations;

namespace EduSyncAPI.Models
{
    public class UpdateAssessmentDto
    {
        // Include Id for the entity being updated
        [Required]
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required.")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters.")]
        public string Title { get; set; }

        public string Description { get; set; }

        [Required(ErrorMessage = "Start Date is required.")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End Date is required.")]
        public DateTime EndDate { get; set; }

        // IMPORTANT: Only include CourseId, not the full Course object
        [Required(ErrorMessage = "Course ID is required.")]
        public int CourseId { get; set; }

        // You might also want to add properties for questions if you manage them directly via the assessment update
        // public ICollection<QuestionDto> Questions { get; set; } // If you handle question updates via assessment PUT
    }
}