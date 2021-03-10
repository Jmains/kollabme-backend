const aws = require("aws-sdk");
const AmazonS3URI = require("amazon-s3-uri");
require("dotenv").config();

const s3Bucket = process.env.S3_BUCKET;

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
});

const s3 = new aws.S3({
  signatureVersion: "v4",
  region: "us-west-1",
});

module.exports.deleteS3Object = async (uri) => {
  try {
    const { region, bucket, key } = AmazonS3URI(uri);
    await s3
      .deleteObject({
        Bucket: s3Bucket,
        Key: key,
      })
      .promise();
  } catch (err) {
    throw new Error("Failed to delete s3 object: ", err);
  }
};

// var params = {
//   Bucket: 'node-sdk-sample-7271',
//   Delete: { // required
//     Objects: [ // required
//       {
//         Key: 'foo.jpg' // required
//       },
//       {
//         Key: 'sample-image--10.jpg'
//       }
//     ],
//   },
// };

// s3.deleteObjects(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });
