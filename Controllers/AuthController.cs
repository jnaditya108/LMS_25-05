using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EduSyncAPI.Models;
using EduSyncAPI.Data;
using Microsoft.EntityFrameworkCore;

namespace EduSyncAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly EduSyncContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(EduSyncContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Username == model.Username))
                {
                    return BadRequest("Username already exists");
                }

                var user = new User
                {
                    Username = model.Username,
                    Password = model.Password, // Store password as plain text
                    Email = model.Email,
                    Role = model.Role ?? "Student" // Default to Student if not specified
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User registered successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error registering user", error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                Console.WriteLine($"Login attempt for username: {model.Username}");

                // First, try to find the user by username only
                var userByUsername = await _context.Users
                    .FirstOrDefaultAsync(u => u.Username == model.Username);

                if (userByUsername == null)
                {
                    Console.WriteLine("User not found in database");
                    return Unauthorized("Invalid username or password");
                }

                Console.WriteLine($"Found user: {userByUsername.Username}, Password in DB: {userByUsername.Password}, Provided password: {model.Password}");

                // Now check password
                if (userByUsername.Password != model.Password)
                {
                    Console.WriteLine("Password mismatch");
                    return Unauthorized("Invalid username or password");
                }

                Console.WriteLine("Password matched, generating token");
                var token = GenerateJwtToken(userByUsername);

                return Ok(new
                {
                    token = token,
                    userId = userByUsername.Id,
                    username = userByUsername.Username,
                    role = userByUsername.Role
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error during login", error = ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-super-secret-key-here");
            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("userId", user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class LoginModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class RegisterModel
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}