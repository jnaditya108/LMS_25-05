using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using EduSyncAPI.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using EduSyncAPI.Services; // Ensure this namespace is correct for your UserService

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// CORS Configuration - START
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            // IMPORTANT: Replace "http://localhost:3000" with the exact URL of your React frontend.
            // If you deploy your frontend, this URL will need to be updated.
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod(); // This allows all HTTP methods, including OPTIONS for preflight requests
        });
});
// CORS Configuration - END

builder.Services.AddScoped<IUserService, UserService>(); // Assuming IUserService and UserService are correctly defined

// Configuration for JWT tokens
// Ensure your appsettings.json contains these under Jwt section
// Example:
//  "Jwt": {
//    "SecretKey": "your-very-secure-secret-key",
//    "Issuer": "myapp",
//    "Audience": "myapp-users"
//  }

// Add controllers
builder.Services.AddControllers();

// Add Swagger (for API testing & docs)
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Fetch JWT configuration from appsettings.json
var jwtSecretKey = builder.Configuration.GetValue<string>("Jwt:SecretKey");
var issuer = builder.Configuration.GetValue<string>("Jwt:Issuer");
var audience = builder.Configuration.GetValue<string>("Jwt:Audience");

// Configure JWT authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
    };
});

// Add database context – replace your connection string name if different
builder.Services.AddDbContext<EduSyncContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Build your app
var app = builder.Build();

// Middleware pipeline

// Enable Swagger in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS middleware - IMPORTANT: Place this before UseAuthentication() and UseAuthorization()
app.UseCors("AllowSpecificOrigin"); // Use the policy name you defined

// Important: Enable Authentication *before* Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers (routes)
app.MapControllers();

app.Run();