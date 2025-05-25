// EduSyncAPI/Models/Assessment.cs (REPLACE THIS FILE ENTIRELY)

using System; // For DateTime
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations; // For [Key], [Required], [MaxLength]
using System.ComponentModel.DataAnnotations.Schema; // For [ForeignKey] if needed (though not strictly necessary with navigation properties)
using System.Text.Json.Serialization; // REQUIRED for [JsonIgnore]
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation; // REQUIRED for [ValidateNever]

namespace EduSyncAPI.Models
{
    public class Assessment
    {
        [Key] // Denotes primary key
        public int Id { get; set; }

        [Required] // Makes Title a required field in the database
        [MaxLength(255)] // Sets max length for Title
        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Foreign key to Course (REQUIRED for linking assessments to courses)
        [Required] // Ensure CourseId is explicitly required
        public int CourseId { get; set; }

        // Navigation property to the Course (useful for including course data in queries)
        // [JsonIgnore] // You might need this if Course itself causes a cycle in some serialization context (already handled with DTOs in controller)
        // [ValidateNever] // Not strictly needed here unless you're trying to bind a full Course object into an Assessment POST/PUT
        public Course Course { get; set; }

        // Collection of questions for this assessment
        public ICollection<Question> Questions { get; set; } = new List<Question>();

        // Collection of student answers for this assessment
        public ICollection<StudentAnswer> StudentAnswers { get; set; } = new List<StudentAnswer>();
    }

    public class Question
    {
        [Key] // Primary key for Question
        public int Id { get; set; }

        [Required] // Question text is typically required
        public string Text { get; set; }

        public string QuestionType { get; set; } // e.g., multiple-choice, true/false, short-answer

        // Foreign key to Assessment
        [Required] // Ensure AssessmentId is explicitly required
        public int AssessmentId { get; set; }

        // Navigation property to Assessment
        [JsonIgnore] // <<<<<<<<<<<<<<<<< IMPORTANT: IGNORE ON JSON DESERIALIZATION
        [ValidateNever] // <<<<<<<<<<<<<<<<< IMPORTANT: IGNORE ON MODEL VALIDATION
        public Assessment Assessment { get; set; }

        // Collection of options for this question
        public ICollection<Option> Options { get; set; } = new List<Option>();
    }

    public class Option
    {
        [Key] // Primary key for Option
        public int Id { get; set; }

        [Required] // Option text is typically required
        public string Text { get; set; }

        public bool IsCorrect { get; set; }

        // Foreign key to Question
        [Required] // Ensure QuestionId is explicitly required
        public int QuestionId { get; set; }

        // Navigation property to Question
        [JsonIgnore] // <<<<<<<<<<<<<<<<< IMPORTANT: IGNORE ON JSON DESERIALIZATION
        [ValidateNever] // <<<<<<<<<<<<<<<<< IMPORTANT: IGNORE ON MODEL VALIDATION
        public Question Question { get; set; }
    }

    public class StudentAnswer
    {
        [Key] // Primary key for StudentAnswer
        public int Id { get; set; }

        [Required] // Ensure QuestionId is explicitly required
        public int QuestionId { get; set; }

        [Required] // Ensure UserId is explicitly required
        public int UserId { get; set; }

        [Required] // Ensure AnswerText is explicitly required (or adapt as needed)
        public string AnswerText { get; set; } // for open-ended or selected option IDs

        public DateTime AnsweredOn { get; set; } // Automatically set or handled in controller/service

        // Navigation properties (nullable for flexibility, or make required if always present)
        public Question? Question { get; set; }
        public User? User { get; set; } // Ensure User model is defined elsewhere.
    }
}