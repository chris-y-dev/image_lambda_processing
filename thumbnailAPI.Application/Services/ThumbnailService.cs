using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Http;

namespace thumbnailAPI.Application;

public class ThumbnailService : IThumbnailService
{
    private readonly IAwsConnectionFactory _awsConnectionFactory;
    private readonly IAmazonS3 _s3;
    public ThumbnailService(IAwsConnectionFactory awsConnectionFactory, IAmazonS3 s3)
    {
        _awsConnectionFactory = awsConnectionFactory;
        _s3 = s3;
    }

    public async Task<Boolean> UploadImageToS3Bucket(IFormFile file)
    {
        try
        {


            var s3Client = _awsConnectionFactory.GenerateS3Client();

            var newMemoryStream = new MemoryStream();
            await file.CopyToAsync(newMemoryStream);

            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = newMemoryStream,
                BucketName = "input",
                ContentType = file.ContentType,
                Key = file.FileName,
            };

            var fileTransferUtility = new TransferUtility(s3Client);
            await fileTransferUtility.UploadAsync(uploadRequest);

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex);
            return false;
        }
    }
}