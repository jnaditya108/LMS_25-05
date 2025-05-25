using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims; 

namespace EduSyncAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserProfileController : ControllerBase
    {
        // GET: api/userprofile/me
        [HttpGet("me")]
        public IActionResult GetMyProfile()
        {
            // Get User claims, e.g., username, role, ID
            // OPTION 1: Using ClaimTypes.Name directly
            var username = User.FindFirstValue(ClaimTypes.Name); // More concise way to get 'Name' claim

            // OPTION 2: Correctly retrieve UserID and Role
            var userId = User.FindFirstValue("UserID"); // Still use "UserID" if that's what you embed literally
            var role = User.FindFirstValue(ClaimTypes.Role); // <-- FIX IS HERE: Use ClaimTypes.Role

            return Ok(new
            {
                UserId = userId,
                Username = username,
                Role = role
            });
        }
    }
}