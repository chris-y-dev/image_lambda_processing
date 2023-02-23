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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.handler = void 0;
var fs = require('fs');
var sharp = require('sharp');
var path = require('path');
var AWS = require("aws-sdk");
var callbackify = require('util').callbackify;
var Readable = require('stream').Readable;
var stream = require('stream');
var Console = require('console').Console;
var credentials = new AWS.Credentials('foo', 'foo', null);
//Trigger -> get -> function -> upload
var handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var s3, bucketOfEvent, keyOfEvent, imageObject, imageFormat, uploadResponses;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                s3 = new AWS.S3({
                    credentials: credentials,
                    region: "localhost",
                    endpoint: "http://host.docker.internal:4566",
                    s3ForcePathStyle: true,
                    useDualstackEndpoint: true,
                    s3BucketEndpoint: false
                });
                console.log(event.Records[0]);
                bucketOfEvent = event.Records[0].s3.bucket.name;
                keyOfEvent = event.Records[0].s3.object.key;
                return [4 /*yield*/, retrieveThumbnailFromS3(s3, bucketOfEvent, keyOfEvent)];
            case 1:
                imageObject = _a.sent();
                return [4 /*yield*/, validateObjectIsImage(imageObject.Body.toString('hex'))];
            case 2:
                imageFormat = _a.sent();
                console.log("FORMAT====================", imageFormat, keyOfEvent);
                if (imageFormat == null) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            body: JSON.stringify({
                                message: 'Unable to convert uploaded file. Please upload an image file with supported format (.jpg, .png)'
                            }, null, 2)
                        }];
                }
                return [4 /*yield*/, resizeThumbnailsAndUpload(s3, imageObject, keyOfEvent, imageFormat)];
            case 3:
                uploadResponses = _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        body: JSON.stringify({
                            message: 'Images resized and uploaded to S3',
                            putResponse: uploadResponses
                        }, null, 2)
                    }];
        }
    });
}); };
exports.handler = handler;
function resizeThumbnailsAndUpload(s3, imageObjectOriginal, imageKey, imageFormat) {
    return __awaiter(this, void 0, void 0, function () {
        var sizesAndNames, resizedOrUploadedResponses, _i, sizesAndNames_1, newSize, resizedImageBuffer, uploadResponse, err_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sizesAndNames = [
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
                    resizedOrUploadedResponses = [];
                    _i = 0, sizesAndNames_1 = sizesAndNames;
                    _a.label = 1;
                case 1:
                    if (!(_i < sizesAndNames_1.length)) return [3 /*break*/, 10];
                    newSize = sizesAndNames_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, sharp(imageObjectOriginal.Body).resize({
                            width: newSize.width,
                            height: newSize.height,
                            fit: sharp.fit.cover
                        })
                            .withMetadata()
                            .toBuffer()];
                case 3:
                    resizedImageBuffer = _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, putObject(s3, resizedImageBuffer, newSize, imageKey, imageFormat)];
                case 5:
                    uploadResponse = _a.sent();
                    resizedOrUploadedResponses.push(uploadResponse);
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.log(err_1);
                    resizedOrUploadedResponses.push(err_1);
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    err_2 = _a.sent();
                    console.log(err_2);
                    resizedOrUploadedResponses.push(err_2);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, resizedOrUploadedResponses];
            }
        });
    });
}
function retrieveThumbnailFromS3(s3, bucket, key) {
    return __awaiter(this, void 0, void 0, function () {
        var imageObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, s3.getObject({
                        Bucket: bucket,
                        Key: key
                    }).promise()];
                case 1:
                    imageObject = _a.sent();
                    return [2 /*return*/, imageObject];
            }
        });
    });
}
function putObject(s3, resizedImageBuffer, imageSize, imageKey, imageFormat) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    imageKey = imageKey.split(".")[0];
                    return [4 /*yield*/, s3.upload({
                            Body: resizedImageBuffer,
                            Bucket: "output",
                            Key: imageKey + "_" + imageSize.size + "." + imageFormat.format
                        }).promise()];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function validateObjectIsImage(imageObjectString) {
    return __awaiter(this, void 0, void 0, function () {
        var imageHeaders, _a, testPng, testJpg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    imageHeaders = [
                        {
                            "format": "png",
                            "hexPattern": "89504e470d0a1a0a"
                        },
                        {
                            "format": "jpg",
                            "hexPattern": "ffd8ff"
                        }
                    ];
                    return [4 /*yield*/, Promise.all([
                            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[0], imageObjectString),
                            ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeaders[1], imageObjectString),
                        ])];
                case 1:
                    _a = _b.sent(), testPng = _a[0], testJpg = _a[1];
                    if (testPng != null)
                        return [2 /*return*/, testPng];
                    if (testJpg != null)
                        return [2 /*return*/, testJpg];
                    console.log("ERROR: OBJECT IS NOT AN IMAGE");
                    return [2 /*return*/, null];
            }
        });
    });
}
function ifRegexMatch_ReturnRegexData_ElseReturnNull(imageHeader, imageBufferString) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log(imageHeader.hexPattern, imageBufferString);
            return [2 /*return*/, new RegExp("^".concat(imageHeader.hexPattern)).test(imageBufferString) ? imageHeader : null];
        });
    });
}
