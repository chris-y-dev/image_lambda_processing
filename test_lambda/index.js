'use strict';
const fs = require('fs');
const sharp = require('sharp')
const path = require('path');
const AWS = require("aws-sdk");
const { callbackify } = require('util');
const { Readable } = require('stream');
const stream = require('stream');
const { Console } = require('console');

var credentials = new AWS.Credentials('foo', 'foo', null)

//Trigger -> get -> function -> upload
module.exports.handler = async (event, context) => {

  const s3 = new AWS.S3(
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
  const bucketOfEvent = event.Records[0].s3.bucket.name
  const keyOfEvent = event.Records[0].s3.object.key

  //Retrieve image from s3
  var imageObject = await retrieveThumbnailFromS3(s3, bucketOfEvent, keyOfEvent);

  // console.log("BYTES:::::::::::::::::::::: ", imageObject.Body.toString('hex'))
  var imageFormat = await validateObjectIsImage(imageObject.Body.toString('hex'))
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
  var uploadResponses = await resizeThumbnailsAndUpload(s3, imageObject)
  
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

async function resizeThumbnailsAndUpload(s3, imageObjectOriginal){

  const sizesAndNames = [
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

  const uploadResponses = []

  for (const newSize of sizesAndNames){

    try{

      var resizedImageObject = await sharp(imageObjectOriginal.Body).resize({
        width: newSize.width,
        height: newSize.height,
        fit: sharp.fit.cover
      })
      .withMetadata()
      .toBuffer();

    } catch (err){
      
      console.log(err)
      
    }
    
    try {
      var uploadResponse = await putObject(s3, resizedImageObject, newSize);
      uploadResponses.push(uploadResponse)

    } catch (err){

      console.log(err)

    }

  }

  return uploadResponses;
}

async function retrieveThumbnailFromS3(s3, bucket, key){

  var imageObject = await s3.getObject(
    { 
      Bucket: bucket, 
      Key: key 
    }).promise()

  return imageObject
}

async function putObject(s3, imageObject, imageProperties){

  console.log(imageObject)

  var response = await s3.upload(
    {
      Body: imageObject,
      Bucket: "output", 
      Key: "player_" + imageProperties.size + ".png"
    }
  ).promise();

  return response
}

async function validateObjectIsImage(imageObjectString){

  const imageHeaders = [
    { 
      "format": "png",
      "code": "89504e470d0a1a0a"
    },
    { 
      "format": "jpg",
      "code": "FFD8FFE0"
    },
    { 
      "format": "gif",
      "code": "474946383761"
    },
    { 
      "format": "tif",
      "code": "49492a00"
    },
    { 
      "format": "tiff",
      "code": "4d4d002a"
    }
  ]

  let [testPng, testJpg, testGif, testTif, testTiff ] = await Promise.all([
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[0], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[1], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[2], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[3], imageObjectString),
    ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[4], imageObjectString)
  ])

  if(testPng != null) return testPng.format
  if(testJpg != null) return testJpg.format
  if(testGif != null) return testGif.format
  if(testTif != null) return testTif.format
  if(testTiff != null) return testTiff.format

  return null
}

async function ifRegexMatch_ReturnRegexData_ElseReturnNull(regexData, string){

  console.log(regexData.code)

  return new RegExp(`^${regexData.code}`).test(string)? regexData : null;

}

