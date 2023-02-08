"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const fs = require('fs');
const sharp_1 = __importDefault(require("sharp"));
const path = require('path');
const AWS = require("aws-sdk");
const { callbackify } = require('util');
const { Readable } = require('stream');
const stream = require('stream');
const { Console } = require('console');
var credentials = new AWS.Credentials('foo', 'foo', null);
//Trigger -> get -> function -> upload
const handler = (event, context) => __awaiter(void 0, void 0, void 0, function* () {
    const s3 = new AWS.S3({
        credentials: credentials,
        region: "localhost",
        endpoint: "http://host.docker.internal:4566",
        s3ForcePathStyle: true,
        useDualstackEndpoint: true,
        s3BucketEndpoint: false,
    });
    console.log(event.Records[0]);
    //Event values
    const bucketOfEvent = event.Records[0].s3.bucket.name;
    const keyOfEvent = event.Records[0].s3.object.key;
    //Retrieve image from s3
    const imageObject = yield retrieveThumbnailFromS3(s3, bucketOfEvent, keyOfEvent);
    // console.log("BYTES:::::::::::::::::::::: ", imageObject.Body.toString('hex'))
    const imageFormat = yield validateObjectIsImage(imageObject.Body.toString('hex'));
    console.log("FORMAT====================", imageFormat);
    if (imageFormat == null) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'File successfulyl uploaded',
            }, null, 2),
        };
    }
    //Logic + upload
    const uploadResponses = yield resizeThumbnailsAndUpload(s3, imageObject);
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Images resized and uploaded to S3',
            putResponse: uploadResponses
        }, null, 2),
    };
});
exports.handler = handler;
function resizeThumbnailsAndUpload(s3, imageObjectOriginal) {
    return __awaiter(this, void 0, void 0, function* () {
        const sizesAndNames = [
            {
                size: "small",
                width: 200,
                height: 200
            },
            {
                size: "medium",
                width: 350,
                height: 350
            },
            {
                size: "large",
                width: 500,
                height: 500
            },
            {
                size: "xlarge",
                width: 700,
                height: 700
            }
        ];
        const resizedOrUploadedResponses = [];
        for (const newSize of sizesAndNames) {
            try {
                const resizedImageBuffer = yield (0, sharp_1.default)(imageObjectOriginal.Body).resize({
                    width: newSize.width,
                    height: newSize.height,
                    fit: sharp_1.default.fit.cover
                })
                    .withMetadata()
                    .toBuffer();
                try {
                    var uploadResponse = yield putObject(s3, resizedImageBuffer, newSize);
                    resizedOrUploadedResponses.push(uploadResponse);
                }
                catch (err) {
                    console.log(err);
                    resizedOrUploadedResponses.push(err);
                }
            }
            catch (err) {
                console.log(err);
                resizedOrUploadedResponses.push(err);
            }
        }
        return resizedOrUploadedResponses;
    });
}
function retrieveThumbnailFromS3(s3, bucket, key) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageObject = yield s3.getObject({
            Bucket: bucket,
            Key: key
        }).promise();
        return imageObject;
    });
}
function putObject(s3, resizedImageBuffer, imageSize) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield s3.upload({
            Body: resizedImageBuffer,
            Bucket: "output",
            Key: "player_" + imageSize.size + ".png"
        }).promise();
    });
}
function validateObjectIsImage(imageObjectString) {
    return __awaiter(this, void 0, void 0, function* () {
        const imageHeaders = [
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
        ];
        let [testPng, testJpg, testGif, testTif, testTiff] = yield Promise.all([
            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[0], imageObjectString),
            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[1], imageObjectString),
            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[2], imageObjectString),
            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[3], imageObjectString),
            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[4], imageObjectString)
        ]);
        if (testPng != null)
            return testPng;
        if (testJpg != null)
            return testJpg;
        if (testGif != null)
            return testGif;
        if (testTif != null)
            return testTif;
        if (testTiff != null)
            return testTiff;
        return null;
    });
}
function ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeader, imageBufferString) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(imageHeader.hexPattern);
        return new RegExp(`^${imageHeader.hexPattern}`).test(imageBufferString) ? imageHeader : null;
    });
}
//# sourceMappingURL=index.js.map