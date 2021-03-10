const authResolver = require("./auth");
const postResolver = require("./post");
const commentResolver = require("./comment");
const userResolver = require("./user");
const fileUploadResolver = require("./fileUpload");
const notificationResolver = require("./notification");
const messageResolver = require("./message");
const chatResolver = require("./chat");
const trackResolver = require("./track");
const paintingResolver = require("./painting");
const albumResolver = require("./album");
const commentReplyResolver = require("./commentReply");
const videoResolver = require("./video");
const likeResolver = require("./like");

module.exports = {
  Post: {
    likeCount: (parent) => parent.likes.length,
    commentCount: (parent) => parent.comments.length,
  },
  Comment: {
    likeCount: (parent) => parent.likes.length,
    replyCount: (parent) => parent.replies.length,
  },
  CommentReply: {
    likeCount: (parent) => parent.likes.length,
  },
  User: {
    collaboratorCount: (parent) => parent.collaborators.length,
    followingCount: (parent) => parent.following.length,
    followerCount: (parent) => parent.followers.length,
  },
  Painting: {
    likeCount: (parent) => parent.likes.length,
  },
  Track: {
    likeCount: (parent) => parent.likes.length,
  },
  Album: {
    likeCount: (parent) => parent.likes.length,
  },
  Video: {
    likeCount: (parent) => parent.likes.length,
  },
  Query: {
    ...postResolver.Query,
    ...userResolver.Query,
    ...fileUploadResolver.Query,
    ...authResolver.Query,
    ...notificationResolver.Query,
    ...messageResolver.Query,
    ...chatResolver.Query,
    ...trackResolver.Query,
    ...paintingResolver.Query,
    ...albumResolver.Query,
    ...commentResolver.Query,
    ...commentReplyResolver.Query,
    ...videoResolver.Query,
    ...likeResolver.Query,
  },
  Mutation: {
    ...authResolver.Mutation,
    ...postResolver.Mutation,
    ...commentResolver.Mutation,
    ...commentReplyResolver.Mutation,
    ...userResolver.Mutation,
    ...fileUploadResolver.Mutation,
    ...notificationResolver.Mutation,
    ...messageResolver.Mutation,
    ...chatResolver.Mutation,
    ...trackResolver.Mutation,
    ...paintingResolver.Mutation,
    ...albumResolver.Mutation,
    ...videoResolver.Mutation,
  },
  Subscription: {
    ...notificationResolver.Subscription,
    ...messageResolver.Subscription,
    ...chatResolver.Subscription,
  },
};
