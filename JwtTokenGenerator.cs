using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public static class JwtTokenGenerator
{
    public static string GenerateToken(string username, string secretKey, string issuer, string audience, int userId, string role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),                 // Username
            new Claim("UserID", userId.ToString()),               // User ID
            new Claim(ClaimTypes.Role, role)                      // Role of the user
        };

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.Now.AddHours(1), // Token valid for 1 hour
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}