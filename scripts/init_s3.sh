#!/bin/bash

echo "Running s3 script"

awslocal s3 mb s3://input

awslocal s3 mb s3://output

#Create IAM policy
aws iam create-policy --policy-name my-pol --policy-document file:///docker-entrypoint-initaws.d/iam_policy.json --endpoint-url http://localhost:4566

#Create IAM Role
aws iam create-role \
    --role-name lambda-s3-role \
    --assume-role-policy-document "{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}" \
    --endpoint-url http://localhost:4566

#Attach Policy to Role
aws iam attach-role-policy \
    --policy-arn arn:aws:iam::000000000000:policy/my-pol \
    --role-name lambda-s3-role \
    --endpoint-url http://localhost:4566

#Create Lambda Function and assign Role
awslocal lambda create-function \
    --endpoint-url=http://localhost:4566 \
	--region ap-southeast-2 \
    --function-name imageNotification \
    --role lambda-s3-role \
    --handler build/index.handler \
    --runtime nodejs14.x \
    --zip-file fileb:///docker-entrypoint-initaws.d/ThumbnailLambda.zip

#Add notification configuration to S3 bucket
aws s3api put-bucket-notification-configuration \
    --bucket input \
    --notification-configuration file:///docker-entrypoint-initaws.d/s3notification.json \
    --endpoint-url http://localhost:4566