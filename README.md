# ImageProcessor
A fullstack creative class project for WashU CSE330
It's a web application that analyzes elements in uploaded images with the AWS Rekognition model and supports a user-managed image library

Guidance for users:
1. Install packages, including AWS and MySQL
2. Download AWS credential and store locally, modify rekognition.js in the server folder if necessary
3. Create connection to MySQL database in database.js
4. Run npm start in both server and client folder

Tables in the database can be found in the tables folder
If you want to store an image, put it in the client/public/images folder. The database will store a path to the image.