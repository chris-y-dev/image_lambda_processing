# Upload image and auto-resize: A local AWS and API application

![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/thumbnail_program_workflow.jpg?raw=true)

This application includes a local API that allows you to upload an image. If the image is in a valid format (jpg/png), the image will be uploaded to a locally hosted AWS S3 bucket, which triggers a Lambda Function to generate and upload re-sized thumnbnails of the image to these following sizes:

- small: 200x200px
- medium: 350x350px
- large: 500x500px
- x-large: 700x700px

---

# How to run the application 🏃‍♂️🏃‍♀️

## 1. Clone the repository 💾

---

## 2. Build and start Docker containers 🐳

In the root directory, run this command to build the Docker containers:

`docker-compose build`

After the build, run command to start the Docker containers:

`docker-compose up -d`

---

## 3. Open up the API on your browser 💻

`http://localhost:5035/swagger/index.html`

## ![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/thumbnailapi_screenshot.jpg?raw=true)

## 4. Access the AWS S3 buckets on your browser ☁

The "input" bucket is where the original uploaded image will be saved to.
`http://localhost:4566/input`

Images uploaded to the "input" bucket will trigger the Lambda function, which uploads the re-sized images into the "output" bucket.

`http://localhost:4566/output`
![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/input_bucket_screenshot.jpg?raw=true)
![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/output_bucket_screenshot.jpg?raw=true)

---

## 5. Upload an image using the API 🖼

You can upload your own image (.jpg or .png files), or try the cool_cat.jpg provided in the directory root :)

`./cool_cat.jpg`

![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/cool_cat.jpg?raw=true)

After successfully uploading, you can find the original image in the "input" bucket.

![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/uploaded_input_bucket.jpg?raw=true)

The Lambda Function will then retrieve this image uploaded and process it into different sizes, and upload them all to the "output" bucket
![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/uploaded_output_bucket.jpg?raw=true)

---

## 6. Try saving the re-sized image! 🖼🖼🖼🖼

You can save and view the processed images by putting them in to the URL :)

`http://localhost:4566/output/<your-image-name.jpg>`

![alt text](https://github.com/chrisyuen976/thumbnailAPI/blob/master/readme_images/output_images.jpg?raw=true)
