// File: Models/CreateAssessmentDto.cs

using System;
using System.ComponentModel.DataAnnotations; // Don't forget this for [Required]

public class CreateAssessmentDto
{
    [Required(ErrorMessage = "Title is required.")]
    [MaxLength(255)]
    public string Title { get; set; }

    public string Description { get; set; } // Description can be null/empty

    [Required(ErrorMessage = "Start Date is required.")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End Date is required.")]
    public DateTime EndDate { get; set; }

    [Required(ErrorMessage = "Course ID is required.")] // Explicitly mark CourseId as required here
    public int CourseId { get; set; }
    // IMPORTANT: DO NOT include 'public Course Course { get; set; }' in the DTO.
    // The DTO only represents the *input* from the client.
}