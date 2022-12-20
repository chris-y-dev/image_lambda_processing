using Amazon.Runtime;
using Amazon.S3;

namespace thumbnailAPI.Application;

public class AwsConnectionFactory : IAwsConnectionFactory
{
    public AmazonS3Client GenerateS3Client()
    {
        var config = new AmazonS3Config { ServiceURL = "http://localhost:4567" };
        var credentials = new BasicAWSCredentials("foo", "foo");
        var s3Client = new AmazonS3Client(credentials, config);

        return s3Client;
    }
}