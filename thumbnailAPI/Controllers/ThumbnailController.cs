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

    private readonly ILogger<ThumbnailController> _logger;
    private readonly IThumbnailService _thumbnailService;

    public ThumbnailController(ILogger<ThumbnailController> logger, IThumbnailService thumbnailService)
    {
        _logger = logger;
        _thumbnailService = thumbnailService;
    }

    [HttpPost]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest();
        }

        if (!(file.ContentType == "image/jpeg" || file.ContentType == "image/png"))
        {
            return BadRequest("File uploaded was not of supported image type (.jpg, .jpeg and .png only)");
        }

        var uploaded = await _thumbnailService.UploadImageToS3Bucket(file);

        if (uploaded) return Ok("File: " + file.FileName + ", Type: " + file.ContentType + " Successfully Uploaded");

        return BadRequest();
    }
}