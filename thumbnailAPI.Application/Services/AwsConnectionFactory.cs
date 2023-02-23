using Amazon;
using Amazon.Runtime;
using Amazon.S3;

namespace thumbnailAPI.Application;

public class AwsConnectionFactory : IAwsConnectionFactory
{
    public AmazonS3Client GenerateS3Client()
    {
        var config = new AmazonS3Config
        {
            ServiceURL = "http://localstack:4566",
            UseHttp = true,
            ForcePathStyle = true,
            AuthenticationRegion = "ap-southeast-2",
        };
        var credentials = new BasicAWSCredentials("test", "test");
        var s3Client = new AmazonS3Client(credentials, config);

        Console.WriteLine("Agent created");
        // Console.WriteLine(s3Client.GetBucketLocationAsync("input"));

        return s3Client;
    }
}