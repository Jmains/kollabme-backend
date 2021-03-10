const checkAuth = require("../../utils/check-auth");
const aws = require("aws-sdk");
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

module.exports = {
  Query: {
    getProfilePic: () => {},
  },
  Mutation: {
    signS3: async (_, { filename, filetype, uploadType, filesize }, context) => {
      // TODO: Check if user is logged in
      checkAuth(context);

      const s3Params = {
        Bucket: s3Bucket,
        Key: filename,
        Expires: 600,
        ContentType: filetype,
        ACL: "public-read",
      };

      if (uploadType === "images") {
        if (filesize > 50000000) {
          throw new Error("File size must be under 50 mb");
        }
        if (filetype !== "image/jpeg" && filetype !== "image/png") {
          throw new Error("File must be of type jpg, jpeg, or png.");
        }

        try {
          const signedRequest = await s3.getSignedUrl("putObject", s3Params);
          const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;
          return {
            signedRequest,
            url,
          };
        } catch (error) {
          throw new Error("failed to s3 sign request for images: " + error);
        }
      } else if (uploadType === "paintings") {
        if (filesize > 50000000) {
          throw new Error("File size must be under 50 mb");
        }
        if (filetype !== "image/jpeg" && filetype !== "image/png") {
          throw new Error("File must be of type jpg, jpeg, or png.");
        }

        try {
          const signedRequest = await s3.getSignedUrl("putObject", s3Params);
          const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;
          return {
            signedRequest,
            url,
          };
        } catch (error) {
          throw new Error("failed to s3 sign request for images: " + error);
        }
      } else if (uploadType === "videos") {
        if (filesize > 5000000000) {
          throw new Error("File size must be under 5 gb");
        }
        if (
          filetype !== "video/ogg" &&
          filetype !== "video/mov" &&
          filetype !== "video/mp4" &&
          filetype !== "audio/x-m4a" &&
          filetype !== "video/quicktime"
        ) {
          throw new Error("File must be of type OGG, MOV, MP4 or HLS");
        }

        try {
          const signedRequest = await s3.getSignedUrl("putObject", s3Params);
          const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;
          return {
            signedRequest,
            url,
          };
        } catch (error) {
          throw new Error("failed to s3 sign request for videos: " + error);
        }
      } else if (uploadType === "tracks") {
        if (filesize > 100000000) {
          throw new Error("File size must be under 100 mb");
        }
        if (
          filetype !== "audio/mpeg" &&
          filetype !== "audio/x-m4a" &&
          filetype !== "audio/flac"
        ) {
          throw new Error("File must be of type FLAC, MP4 or MP3");
        }
        try {
          const signedRequest = await s3.getSignedUrl("putObject", s3Params);
          const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;
          return {
            signedRequest,
            url,
          };
        } catch (err) {
          throw new Error("failed to s3 sign request for images: " + error);
        }
      } else if (uploadType === "audios") {
        if (filesize > 100000000) {
          throw new Error("File size must be under 100 mb");
        }
        if (
          filetype !== "audio/mpeg" &&
          filetype !== "audio/x-m4a" &&
          filetype !== "audio/flac"
        ) {
          throw new Error("File must be of type FLAC, MP4 or MP3");
        }
        try {
          const signedRequest = await s3.getSignedUrl("putObject", s3Params);
          const url = `https://${s3Bucket}.s3.amazonaws.com/${filename}`;
          return {
            signedRequest,
            url,
          };
        } catch (err) {
          throw new Error("failed to s3 sign request for images: " + error);
        }
      }
    },
  },
};
