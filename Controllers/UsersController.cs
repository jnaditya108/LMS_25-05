using Microsoft.AspNetCore.Mvc;
using EduSyncAPI.Models;
using EduSyncAPI.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace EduSyncAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly EduSyncContext _context;
        private readonly IConfiguration _configuration;

        public UsersController(EduSyncContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration; // for JWT, retained
        }

        // **Existing Login methods preserved**
        // POST: api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginData)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginData.Username);
            if (user == null)
                return Unauthorized();

            if (user.Password != loginData.Password)
                return Unauthorized();

            // Generate JWT token
            var secretKey = _configuration["Jwt:SecretKey"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];

            var token = JwtTokenGenerator.GenerateToken(
                user.Username,
                secretKey,
                issuer,
                audience,
                user.Id,
                user.Role
            );

            return Ok(new { token, userId = user.Id, role = user.Role });
        }

        // **New: Register User API**
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            // Check for existing username or email
            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                return BadRequest("Username already exists.");

            // In production, hash password before saving
            // For demo, consider PasswordHash field contains plain text for now
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User registered", userId = user.Id });
        }

        // **Get User by ID**
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return Ok(user);
        }

        // **Update User Profile**
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            if (id != updatedUser.Id)
                return BadRequest("ID mismatch.");

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            // Update fields, but consider password change separately
            user.Username = updatedUser.Username;
            user.Email = updatedUser.Email;
            user.Role = updatedUser.Role;
            // To update password, implement separate endpoint or logic
            // For now, assume PasswordHash remains unchanged unless explicitly updated

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // **Delete User**
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }

    // Keep your LoginDto as is
    public record LoginDto(string Username, string Password);
}