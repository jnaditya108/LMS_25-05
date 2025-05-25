using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EduSyncAPI.Models; // Make sure this namespace matches where your DTOs are defined
using EduSyncAPI.Data;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq; // Needed for .Select(), .AnyAsync(), .Where()
using System; // Needed for DateTime

namespace EduSyncAPI.Controllers
{
    // Reminder: CreateAssessmentDto.cs, CourseDto.cs, AssessmentDto.cs, and UpdateAssessmentDto.cs
    // should be in your Models folder.

    [Route("api/[controller]")]
    [ApiController]
    public class AssessmentsController : ControllerBase
    {
        private readonly EduSyncContext _context;

        public AssessmentsController(EduSyncContext context)
        {
            _context = context;
        }

        // GET: api/Assessments - Get all assessments
        // Reverted to [HttpGet] - The default routing should handle this correctly
        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssessmentDto>>> GetAssessments()
        {
            var assessments = await _context.Assessments
                                             .Include(a => a.Course)
                                             .ToListAsync();

            var assessmentDtos = assessments.Select(assessment => new AssessmentDto
            {
                Id = assessment.Id,
                Title = assessment.Title,
                Description = assessment.Description,
                StartDate = assessment.StartDate,
                EndDate = assessment.EndDate,
                CourseId = assessment.CourseId,
                Course = assessment.Course != null ? new CourseDto
                {
                    Id = assessment.Course.Id,
                    Title = assessment.Course.Title,
                    Description = assessment.Course.Description,
                    InstructorId = assessment.Course.InstructorId
                } : null
            }).ToList();

            return assessmentDtos;
        }


        // GET: api/Assessments/{id} - Get a single assessment by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<AssessmentDto>> GetAssessment(int id)
        {
            var assessment = await _context.Assessments
                                           .Include(a => a.Course)
                                           .FirstOrDefaultAsync(a => a.Id == id);

            if (assessment == null)
            {
                return NotFound();
            }

            var assessmentDto = new AssessmentDto
            {
                Id = assessment.Id,
                Title = assessment.Title,
                Description = assessment.Description,
                StartDate = assessment.StartDate,
                EndDate = assessment.EndDate,
                CourseId = assessment.CourseId,
                Course = assessment.Course != null ? new CourseDto
                {
                    Id = assessment.Course.Id,
                    Title = assessment.Course.Title,
                    Description = assessment.Course.Description,
                    InstructorId = assessment.Course.InstructorId
                } : null
            };

            return assessmentDto;
        }

        // Create an assessment
        [HttpPost]
        public async Task<IActionResult> CreateAssessment([FromBody] CreateAssessmentDto assessmentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var courseExists = await _context.Courses.AnyAsync(c => c.Id == assessmentDto.CourseId);
            if (!courseExists)
            {
                ModelState.AddModelError("CourseId", "Invalid Course ID. The specified course does not exist.");
                return BadRequest(ModelState);
            }

            var assessment = new Assessment
            {
                Title = assessmentDto.Title,
                Description = assessmentDto.Description,
                StartDate = assessmentDto.StartDate,
                EndDate = assessmentDto.EndDate,
                CourseId = assessmentDto.CourseId
            };

            _context.Assessments.Add(assessment);
            await _context.SaveChangesAsync();

            await _context.Entry(assessment).Reference(a => a.Course).LoadAsync();

            var createdAssessmentDto = new AssessmentDto
            {
                Id = assessment.Id,
                Title = assessment.Title,
                Description = assessment.Description,
                StartDate = assessment.StartDate,
                EndDate = assessment.EndDate,
                CourseId = assessment.CourseId,
                Course = assessment.Course != null ? new CourseDto
                {
                    Id = assessment.Course.Id,
                    Title = assessment.Course.Title,
                    Description = assessment.Course.Description,
                    InstructorId = assessment.Course.InstructorId
                } : null
            };

            return CreatedAtAction(nameof(GetAssessment), new { id = assessment.Id }, createdAssessmentDto);
        }

        // PUT: api/Assessments/{id} - Update an assessment
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAssessment(int id, [FromBody] UpdateAssessmentDto assessmentDto)
        {
            // 1. Validate ID match
            if (id != assessmentDto.Id)
            {
                return BadRequest("Assessment ID in URL does not match ID in request body.");
            }

            // 2. Validate ModelState based on DTO annotations
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Find the existing assessment in the database
            var existingAssessment = await _context.Assessments.FindAsync(id);

            if (existingAssessment == null)
            {
                return NotFound($"Assessment with ID {id} not found.");
            }

            // Check if the CourseId provided exists (important for referential integrity)
            var courseExists = await _context.Courses.AnyAsync(c => c.Id == assessmentDto.CourseId);
            if (!courseExists)
            {
                ModelState.AddModelError("CourseId", "Invalid Course ID. The specified course does not exist.");
                return BadRequest(ModelState);
            }

            // Update properties from DTO to the existing entity
            existingAssessment.Title = assessmentDto.Title;
            existingAssessment.Description = assessmentDto.Description;
            existingAssessment.StartDate = assessmentDto.StartDate;
            existingAssessment.EndDate = assessmentDto.EndDate;
            existingAssessment.CourseId = assessmentDto.CourseId; // This updates the foreign key

            try
            {
                // Save changes to the database
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle concurrency issues: if the assessment was deleted or modified by another user
                if (!await _context.Assessments.AnyAsync(e => e.Id == id))
                {
                    return NotFound($"Assessment with ID {id} not found.");
                }
                else
                {
                    throw; // Re-throw other concurrency exceptions
                }
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"DbUpdateException: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                return StatusCode(500, "An error occurred while updating the assessment. Please check server logs.");
            }

            // 4. Return success (204 No Content)
            return NoContent();
        }

        // DELETE: api/Assessments/{id} - Delete an assessment
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAssessment(int id)
        {
            var assessment = await _context.Assessments.FindAsync(id);
            if (assessment == null)
            {
                return NotFound();
            }

            _context.Assessments.Remove(assessment);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // --- QUESTION MANAGEMENT ENDPOINTS ---

        [HttpPost("{assessmentId}/questions")]
        public async Task<IActionResult> AddQuestions(int assessmentId, [FromBody] List<Question> questions)
        {
            var assessment = await _context.Assessments.FindAsync(assessmentId);
            if (assessment == null)
            {
                return NotFound($"Assessment with ID {assessmentId} not found.");
            }

            foreach (var question in questions)
            {
                if (string.IsNullOrWhiteSpace(question.Text))
                {
                    return BadRequest("Question text cannot be empty.");
                }

                question.AssessmentId = assessmentId;
                _context.Questions.Add(question);
            }

            await _context.SaveChangesAsync();
            return Ok("Questions added successfully");
        }

        [HttpGet("{assessmentId}/questions")]
        public async Task<ActionResult<List<Question>>> GetQuestions(int assessmentId)
        {
            var assessmentExists = await _context.Assessments.AnyAsync(a => a.Id == assessmentId);
            if (!assessmentExists)
            {
                return NotFound($"Assessment with ID {assessmentId} not found.");
            }

            return await _context.Questions
                .Include(q => q.Options)
                .Where(q => q.AssessmentId == assessmentId)
                .ToListAsync();
        }

        [HttpGet("{assessmentId}/questions/{questionId}")]
        public async Task<ActionResult<Question>> GetQuestion(int assessmentId, int questionId)
        {
            var question = await _context.Questions
                                         .Include(q => q.Options)
                                         .FirstOrDefaultAsync(q => q.Id == questionId && q.AssessmentId == assessmentId);

            if (question == null)
            {
                return NotFound($"Question with ID {questionId} for Assessment ID {assessmentId} not found.");
            }

            return question;
        }

        [HttpPut("{assessmentId}/questions/{questionId}")]
        public async Task<IActionResult> UpdateQuestion(int assessmentId, int questionId, [FromBody] Question updatedQuestion)
        {
            if (questionId != updatedQuestion.Id)
            {
                return BadRequest("Question ID in URL does not match ID in body.");
            }
            if (assessmentId != updatedQuestion.AssessmentId)
            {
                return BadRequest("Assessment ID in URL does not match Assessment ID in body.");
            }
            if (string.IsNullOrWhiteSpace(updatedQuestion.Text))
            {
                return BadRequest("Question text cannot be empty.");
            }

            var existingQuestion = await _context.Questions
                                                 .Include(q => q.Options)
                                                 .FirstOrDefaultAsync(q => q.Id == questionId && q.AssessmentId == assessmentId);

            if (existingQuestion == null)
            {
                return NotFound($"Question with ID {questionId} for Assessment ID {assessmentId} not found.");
            }

            _context.Entry(existingQuestion).CurrentValues.SetValues(updatedQuestion);

            var existingOptionsDict = existingQuestion.Options.ToDictionary(o => o.Id);
            var updatedOptions = updatedQuestion.Options ?? new List<Option>();

            foreach (var existingOption in existingQuestion.Options.ToList())
            {
                if (!updatedOptions.Any(uo => uo.Id == existingOption.Id))
                {
                    _context.Options.Remove(existingOption);
                }
            }

            foreach (var updatedOption in updatedOptions)
            {
                if (updatedOption.Id == 0)
                {
                    updatedOption.QuestionId = questionId;
                    _context.Options.Add(updatedOption);
                }
                else
                {
                    if (existingOptionsDict.TryGetValue(updatedOption.Id, out var optionToUpdate))
                    {
                        _context.Entry(optionToUpdate).CurrentValues.SetValues(updatedOption);
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Questions.Any(q => q.Id == questionId))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"DbUpdateException: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                return StatusCode(500, "An error occurred while updating the question and its options. Please check server logs.");
            }

            return NoContent();
        }


        [HttpDelete("{assessmentId}/questions/{questionId}")]
        public async Task<IActionResult> DeleteQuestion(int assessmentId, int questionId)
        {
            var question = await _context.Questions
                                         .FirstOrDefaultAsync(q => q.Id == questionId && q.AssessmentId == assessmentId);

            if (question == null)
            {
                return NotFound($"Question with ID {questionId} for Assessment ID {assessmentId} not found.");
            }

            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitAnswers([FromBody] List<StudentAnswer> answers)
        {
            foreach (var answer in answers)
            {
                _context.StudentAnswers.Add(answer);
            }
            await _context.SaveChangesAsync();
            return Ok("Answers submitted");
        }

        [HttpGet("responses/{assessmentId}")]
        public async Task<ActionResult<IEnumerable<StudentAnswer>>> GetResponses(int assessmentId)
        {
            var assessmentExists = await _context.Assessments.AnyAsync(a => a.Id == assessmentId);
            if (!assessmentExists)
            {
                return NotFound($"Assessment with ID {assessmentId} not found.");
            }

            var responses = await _context.StudentAnswers
                .Include(sa => sa.Question)
                    .ThenInclude(q => q.Assessment)
                .Include(sa => sa.User)
                .Where(sa => sa.Question.AssessmentId == assessmentId)
                .ToListAsync();
            return responses;
        }
    }
}