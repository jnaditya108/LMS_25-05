using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduSyncAPI.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using EduSyncAPI.Data; 

namespace EduSyncAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EnrollmentsController : ControllerBase
    {
        private readonly EduSyncContext _context;

        public EnrollmentsController(EduSyncContext context)
        {
            _context = context;
        }

        // 1. Enroll a student into a course
        [HttpPost("enroll")]
        public async Task<IActionResult> EnrollStudent([FromBody] Enrollment enrollment)
        {
            // Check if already enrolled
            var exists = await _context.Enrollments.FirstOrDefaultAsync(e =>
                e.UserId == enrollment.UserId && e.CourseId == enrollment.CourseId);
            if (exists != null)
                return BadRequest("Student already enrolled in this course.");

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Student enrolled successfully." });
        }

        // 2. Get all students enrolled in a specific course
        [HttpGet("course/{courseId}")]
        public async Task<ActionResult<IEnumerable<User>>> GetEnrolledStudents(int courseId)
        {
            var students = await _context.Enrollments
                .Include(e => e.User)
                .Where(e => e.CourseId == courseId)
                .Select(e => e.User)
                .ToListAsync();

            return Ok(students);
        }

        // 3. Withdraw a student from a course
        [HttpDelete("withdraw")]
        public async Task<IActionResult> WithdrawStudent([FromBody] Enrollment enrollment)
        {
            var enrollmentRecord = await _context.Enrollments.FirstOrDefaultAsync(e =>
                e.UserId == enrollment.UserId && e.CourseId == enrollment.CourseId);
            if (enrollmentRecord == null)
                return NotFound("Enrollment not found.");

            _context.Enrollments.Remove(enrollmentRecord);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Student withdrawn successfully." });
        }
    }
}