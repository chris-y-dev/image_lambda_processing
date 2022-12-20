import { Context, APIGatewayProxyCallback, S3Event } from 'aws-lambda';
import { S3 } from 'aws-sdk';
import { ByteBuffer } from 'aws-sdk/clients/cloudtrail';
const fs = require('fs');
import sharp from 'sharp';
const path = require('path');
const AWS = require("aws-sdk");
const { callbackify } = require('util');
const { Readable } = require('stream');
const stream = require('stream');
const { Console } = require('console');

var credentials = new AWS.Credentials('foo', 'foo', null)

interface ImageSize {
    size: string;
    width: number,
    height: number
}

interface ImageHeader {
  format: string,
  hexPattern: string
}

//Trigger -> get -> function -> upload
export const handler = async (event: S3Event, context: Context) => {

  const s3: AWS.S3 = new AWS.S3(
    {
      credentials: credentials, 
      region: "localhost",
      endpoint: "http://host.docker.internal:4566",
      s3ForcePathStyle: true,
      useDualstackEndpoint: true,
      s3BucketEndpoint: false,
    });

  console.log(event.Records[0])

  //Event values
  const bucketOfEvent: string = event.Records[0].s3.bucket.name
  const keyOfEvent: string = event.Records[0].s3.object.key

  //Retrieve image from s3
  const imageObject: S3.GetObjectOutput = await retrieveThumbnailFromS3(s3, bucketOfEvent, keyOfEvent);

  // console.log("BYTES:::::::::::::::::::::: ", imageObject.Body.toString('hex'))
  const imageFormat: ImageHeader | null = await validateObjectIsImage(imageObject.Body!.toString('hex'))
  console.log("FORMAT====================", imageFormat)

  if(imageFormat==null){
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: 'File successfulyl uploaded',
        },
        null,
        2
      ),
    };
  }

  //Logic + upload
  const uploadResponses: S3.ManagedUpload.SendData[]  = await resizeThumbnailsAndUpload(s3, imageObject)
  
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Images resized and uploaded to S3',
        putResponse: uploadResponses
      },
      null,
      2
    ),
  };
};

async function resizeThumbnailsAndUpload(s3: AWS.S3, imageObjectOriginal: S3.GetObjectOutput){

  const sizesAndNames: ImageSize[] = [
    {
      size: "small",
      width: 200,
      height:200
    },
    {
      size: "medium",
      width: 350,
      height:350
    },
    {
      size: "large",
      width: 500,
      height:500
    },
    {
      size: "xlarge",
      width: 700,
      height:700
    }
  ]

  const resizedOrUploadedResponses: any[]  = []

  for (const newSize of sizesAndNames){

    try{

      const resizedImageBuffer: Buffer = await sharp((imageObjectOriginal.Body as Buffer)).resize({
        width: newSize.width,
        height: newSize.height,
        fit: sharp.fit.cover
      })
      .withMetadata()
      .toBuffer();

      try {

        var uploadResponse: S3.ManagedUpload.SendData  = await putObject(s3, resizedImageBuffer, newSize);
        resizedOrUploadedResponses.push(uploadResponse)
  
      } catch (err){
  
        console.log(err)
        resizedOrUploadedResponses.push(err)
  
      }

    } catch (err){
      
      console.log(err)
      resizedOrUploadedResponses.push(err)
      
    }
    
  }

  return resizedOrUploadedResponses;
}

async function retrieveThumbnailFromS3(s3: AWS.S3, bucket: string, key: string): Promise<S3.GetObjectOutput>{

  const imageObject: S3.GetObjectOutput  = await s3.getObject(
    { 
      Bucket: bucket, 
      Key: key 
    }).promise()

  return imageObject
}

async function putObject(s3: S3, resizedImageBuffer: Buffer, imageSize: ImageSize): Promise<S3.ManagedUpload.SendData>{

  return await s3.upload(
    {
      Body: resizedImageBuffer,
      Bucket: "output", 
      Key: "player_" + imageSize.size + ".png"
    }
  ).promise();
}

async function validateObjectIsImage(imageObjectString: string): Promise<ImageHeader | null>{

  const imageHeaders: ImageHeader[] = [
    { 
      "format": "png",
      "hexPattern": "89504e470d0a1a0a"
    },
    { 
      "format": "jpg",
      "hexPattern": "FFD8FFE0"
    },
    { 
      "format": "gif",
      "hexPattern": "474946383761"
    },
    { 
      "format": "tif",
      "hexPattern": "49492a00"
    },
    { 
      "format": "tiff",
      "hexPattern": "4d4d002a"
    }
  ]

  let [testPng, testJpg, testGif, testTif, testTiff ] = await Promise.all([
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[0], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[1], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[2], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[3], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[4], imageObjectString)
  ])

  if(testPng != null) return testPng
  if(testJpg != null) return testJpg
  if(testGif != null) return testGif
  if(testTif != null) return testTif
  if(testTiff != null) return testTiff

  return null
}

async function ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeader: ImageHeader, imageBufferString: string): Promise<ImageHeader | null>{

  console.log(imageHeader.hexPattern)

  return new RegExp(`^${imageHeader.hexPattern}`).test(imageBufferString)? imageHeader : null;

}

