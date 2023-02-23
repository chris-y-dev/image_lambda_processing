# Upload image and auto-resize: A local AWS and API application

This application includes a local API that allows you to upload an image. If it is a valid format, the image will be uploaded onto a locally hosted AWS S3 bucket, which triggers a Lambda Function to automatically generate re-sized thumnbnails of the image.

- small: 200x200
- medium: 350x350
- large: 500x500
- x-large: 700x700

---

## Run the application

### Clone the repository

### Build and start Docker containers

In the root of the repository, run these commands:

`docker-compose build`

After the build, run this:

`docker-compose up -d`

### Open up the API on your browser

`http://localhost:5035/swagger/index.html`

### Access the AWS S3 buckets on your browser

The "input" bucket is where the original uploaded image will be saved to.
`http://localhost:4566/input`

Images uploaded to the "input" bucket will trigger the Lambda function, which uploads the re-sized images into the "output" bucket.

`http://localhost:4566/output`

### Upload an image using the API

### Try saving the re-sized image!
