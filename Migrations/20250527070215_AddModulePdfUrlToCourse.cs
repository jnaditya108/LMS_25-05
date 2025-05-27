using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EduSyncAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddModulePdfUrlToCourse : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ModulePdfUrl",
                table: "Courses",
                type: "nvarchar(1024)",
                maxLength: 1024,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ModulePdfUrl",
                table: "Courses");
        }
    }
}
