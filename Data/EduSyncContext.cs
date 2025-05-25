// EduSyncAPI/Data/EduSyncContext.cs

using Microsoft.EntityFrameworkCore;
using EduSyncAPI.Models; // Ensure this namespace is correct

namespace EduSyncAPI.Data
{
    public class EduSyncContext : DbContext
    {
        public EduSyncContext(DbContextOptions<EduSyncContext> options) : base(options) { }

        // Your DbSets for all your models
        public DbSet<User> Users { get; set; }
        public DbSet<Assessment> Assessments { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<Enrollment> Enrollments { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<StudentAnswer> StudentAnswers { get; set; }
        public DbSet<Option> Options { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Always call the base method first

            // Configure Enrollment to have a composite primary key
            modelBuilder.Entity<Enrollment>().HasKey(e => new { e.UserId, e.CourseId });

            // Configure foreign key for UserId in Enrollment
            // OnDelete(DeleteBehavior.NoAction) is appropriate here to prevent cascade cycles or unintentional user deletion leading to mass enrollment deletion.
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.User)
                .WithMany() // Assuming User model does not have a collection of Enrollments directly
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.NoAction); // Prevents cascade delete

            // Configure foreign key for CourseId in Enrollment
            // OnDelete(DeleteBehavior.NoAction) is also appropriate here to prevent cascade cycles or unintentional course deletion leading to mass enrollment deletion.
            modelBuilder.Entity<Enrollment>()
                .HasOne(e => e.Course)
                .WithMany(c => c.Enrollments) // Assuming Course model has 'public ICollection<Enrollment> Enrollments { get; set; }'
                .HasForeignKey(e => e.CourseId)
                .OnDelete(DeleteBehavior.NoAction); // Prevents cascade delete

            // Existing configuration for Course to Instructor relationship
            // OnDelete(DeleteBehavior.NoAction) is generally safer for user deletion cycles.
            modelBuilder.Entity<Course>()
                .HasOne(c => c.Instructor) // Instructor is a User
                .WithMany() // Assuming User model does not have an ICollection<Course> for courses taught
                .HasForeignKey(c => c.InstructorId)
                .OnDelete(DeleteBehavior.NoAction); // Changed to NoAction (was Restrict) - generally safer for user deletion cycles


            // Assessment to Course relationship:
            // When a Course is deleted, its Assessments will NOT be automatically deleted.
            // This prevents accidental data loss and forces explicit management.
            modelBuilder.Entity<Assessment>()
                .HasOne(a => a.Course) // An Assessment has one Course
                .WithMany(c => c.Assessments) // A Course can have many Assessments
                .HasForeignKey(a => a.CourseId)
                .OnDelete(DeleteBehavior.NoAction); // Keep as NoAction to prevent accidental course deletion from wiping assessments.


            // --- CRITICAL CHANGES FOR CASCADING DELETES TO RESOLVE FK CONFLICTS ---

            // Question to Assessment relationship:
            // When an Assessment is deleted, its Questions should be automatically deleted.
            // This is a common logical cascade pattern.
            modelBuilder.Entity<Question>()
                .HasOne(q => q.Assessment)
                .WithMany(a => a.Questions)
                .HasForeignKey(q => q.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade); // <<<<<<<<<<<<< CHANGED FROM NOACTION TO CASCADE

            // Option to Question relationship:
            // When a Question is deleted, its Options MUST be automatically deleted.
            // This DIRECTLY addresses the "FK_Options_Questions_QuestionId" conflict you received.
            modelBuilder.Entity<Option>()
                .HasOne(o => o.Question)
                .WithMany(q => q.Options)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade); // <<<<<<<<<<<<< CHANGED FROM NOACTION TO CASCADE

            // StudentAnswer to Question relationship:
            // When a Question is deleted, its StudentAnswers should typically be deleted as they are directly linked to the question.
            // If you need to keep answers for auditing/history even after question deletion, QuestionId would need to be nullable
            // in StudentAnswer, and this behavior would be SetNull. Given it's non-nullable, Cascade is appropriate.
            modelBuilder.Entity<StudentAnswer>()
                .HasOne(sa => sa.Question)
                .WithMany() // Assuming Question doesn't have a direct collection of StudentAnswers
                .HasForeignKey(sa => sa.QuestionId)
                .OnDelete(DeleteBehavior.Cascade); // <<<<<<<<<<<<< CHANGED FROM NOACTION TO CASCADE

            // StudentAnswer to User relationship:
            // When a User is deleted, their StudentAnswers should typically be deleted.
            // Similar to the Question-StudentAnswer relationship, if you need to keep answers for auditing/history
            // even after user deletion, UserId would need to be nullable in StudentAnswer, and this behavior would be SetNull.
            // Given it's non-nullable, Cascade is appropriate to avoid FK errors upon user deletion.
            modelBuilder.Entity<StudentAnswer>()
                .HasOne(sa => sa.User)
                .WithMany() // Assuming User doesn't have a direct collection of StudentAnswers
                .HasForeignKey(sa => sa.UserId)
                .OnDelete(DeleteBehavior.Cascade); // <<<<<<<<<<<<< CHANGED FROM NOACTION TO CASCADE
        }
    }
}