using EduSyncAPI.Services; // To access IUserService
using EduSyncAPI.Models; // Ensure 'User' is accessible

using System.Threading.Tasks;
using EduSyncAPI.Models;

namespace EduSyncAPI.Services
{
    public interface IUserService
    {
        Task<User> GetUserByUsername(string username);
        bool VerifyPassword(string inputPassword, string storedHash);
    }
}
