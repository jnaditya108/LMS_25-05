using System;
using System.Threading.Tasks;
using EduSyncAPI.Data;      // Adjust if your DbContext is in a different namespace
using EduSyncAPI.Models;    // For the User model
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace EduSyncAPI.Services
{
    public class UserService : IUserService
    {
        private readonly EduSyncContext _context;

        public UserService(EduSyncContext context)
        {
            _context = context;
        }

        public async Task<User> GetUserByUsername(string username)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
        }

        public bool VerifyPassword(string inputPassword, string storedHash)
        {
            // Example using SHA256 for hashing (for demonstration only; consider using a stronger algorithm like BCrypt)
            using var sha = SHA256.Create();
            var hashBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(inputPassword));
            var hashString = Convert.ToBase64String(hashBytes);
            return hashString == storedHash;
        }
    }
}
