// File: EduSyncAPI/Models/CourseDto.cs

using System;
// No System.Collections.Generic needed as this DTO won't have collections of other entities
// No System.ComponentModel.DataAnnotations as this is an output DTO, not for validation

namespace EduSyncAPI.Models
{
    public class CourseDto // This DTO represents the Course information you want to expose
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int InstructorId { get; set; }
        // IMPORTANT: DO NOT include 'public ICollection<Assessment> Assessments { get; set; }' here.
        // This is the key to breaking the cycle.
        // Also, do not include 'public User Instructor { get; set; }' here.
    }
}