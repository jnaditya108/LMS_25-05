using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using EduSyncAPI.Models;
using EduSyncAPI.Services;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IConfiguration _configuration;

    public AuthController(IUserService userService, IConfiguration configuration)
    {
        _userService = userService;
        _configuration = configuration;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        var user = await _userService.GetUserByUsername(loginDto.Username);
        if (user == null)
            return Unauthorized();

        // Compare plain text password (no hashing)
        if (user.Password != loginDto.Password)
            return Unauthorized();

        var token = JwtTokenGenerator.GenerateToken(
            user.Username,
            _configuration["Jwt:SecretKey"],
            _configuration["Jwt:Issuer"],
            _configuration["Jwt:Audience"],
            user.Id,
            user.Role
        );

        return Ok(new { token });
    }

    private bool VerifyPassword(User user, string password)
    {
        using var sha = SHA256.Create();
        var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        var hashString = Convert.ToBase64String(hashBytes);
        return hashString == user.Password;
    }
}