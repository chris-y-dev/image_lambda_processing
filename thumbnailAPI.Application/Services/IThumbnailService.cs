using Microsoft.AspNetCore.Http;

namespace thumbnailAPI.Application;

public interface IThumbnailService
{
    public Task<Boolean> UploadImageToS3Bucket(IFormFile file);
}