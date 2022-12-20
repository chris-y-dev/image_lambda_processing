using System.Runtime.InteropServices.JavaScript;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Mvc;
using thumbnailAPI.Application;

namespace thumbnailAPI.Controllers;

[ApiController]
[Route("thumbnail")]
public class ThumbnailController : ControllerBase
{
    private static readonly string[] Summaries = new[]
    {
        "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
    };

    private readonly ILogger<ThumbnailController> _logger;
    private readonly IThumbnailService _thumbnailService;

    public ThumbnailController(ILogger<ThumbnailController> logger, IThumbnailService thumbnailService)
    {
        _logger = logger;
        _thumbnailService = thumbnailService;
    }

    [HttpGet(Name = "Check")]
    public IEnumerable<WeatherForecast> Get()
    {
        var config = new AmazonS3Config{ ServiceURL = "http://localhost:4566" };
        var s3Client = new AmazonS3Client(config);
        
        return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)]
            })
            .ToArray();
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest();
        }

        var uploaded = await _thumbnailService.UploadImageToS3Bucket(file);

        if (uploaded) return Ok(file.FileName + " Uploaded");
        
        return BadRequest();
    }
}