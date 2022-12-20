using Amazon.S3;
using Amazon.Util;

namespace thumbnailAPI.Application;

public interface IAwsConnectionFactory
{
    public AmazonS3Client GenerateS3Client();
}