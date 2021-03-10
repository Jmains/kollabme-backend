const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const CommentReply = require("../../models/CommentReply");
const checkAuth = require("../../utils/check-auth");
const { UserInputError, AuthenticationError } = require("apollo-server");
const paginatedResults = require("../../utils/paginateResults");
const Like = require("../../models/Like");
const Notification = require("../../models/Notification");

module.exports = {
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      // If check passes then we've logged in
      const { id, username } = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty.",
          },
        });
      }
      const post = await Post.findById(postId).populate("comments").populate("author");
      if (post) {
        try {
          const newComment = new Comment({
            author: id,
            postId: post._id,
            body,
            username,
            createdAt: new Date().toISOString(),
            replies: [],
            replyCount: 0,
            likes: [],
            likeCount: 0,
            cursor: new Date().toISOString(),
          });
          post.comments.unshift(newComment);
          const notification = new Notification({
            createdAt: new Date().toISOString(),
            message: `${username} commented on one of your posts.`,
            sender: id,
            recipient: post.author.id,
            type: "NEW_LIKE",
            postId: postId,
            isRead: false,
            cursor: new Date().toISOString(),
          });

          // pubsub.publish(NEW_NOTIFICATION, {
          //   newNotification: notification,
          // });

          await notification.save();
          await newComment.save();
          await post.save();
          const poppedComment = await Comment.findById(newComment._id)
            .populate("author")
            .populate("likes");
          return poppedComment;
        } catch (error) {
          throw new Error("Failed to create comment");
        }
      } else {
        throw new UserInputError("Post not found.");
      }
    },
    deleteComment: async (_, { postId, commentId }, context) => {
      const { id } = checkAuth(context);
      const post = await Post.findById(postId).populate("comments");
      if (post) {
        const comment = await Comment.findById(commentId);
        if (!comment) throw new Error("Comment not found");
        const commentIndex = post.comments.findIndex(
          (comment) => comment._id.toString() === commentId
        );
        if (post.comments[commentIndex].author.toString() === id) {
          post.comments.splice(commentIndex, 1);
          if (comment.replies.length > 0) {
            await CommentReply.deleteMany({ commentId: comment._id.toString() });
          }
          await Like.deleteMany({ comment: commentId });
          await comment.deleteOne();
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed.");
        }
      } else {
        throw new UserInputError("Post not found.");
      }
    },
    likeComment: async (_, { commentId }, context) => {
      const { username, id } = checkAuth(context);
      try {
        const comment = await Comment.findById(commentId).populate("likes");
        if (comment) {
          if (comment.likes.find((like) => like.username === username)) {
            const likeToDelete = await Like.findOne({
              username: username,
              comment: commentId,
            });
            await likeToDelete.deleteOne();
            comment.likes = comment.likes.filter((like) => like.username !== username);
            comment.likeCount -= 1;
          } else {
            const like = new Like({
              author: id,
              username: username,
              comment: comment,
              createdAt: new Date().toISOString(),
              cursor: new Date().toISOString(),
            });
            comment.likes.push(like);
            comment.likes.reverse();
            comment.likeCount += 1;
            await like.save();
          }
          await comment.save();
          return comment;
        }
      } catch (err) {
        throw new Error("Failed to like comment: ", err);
      }
    },
  },
  Query: {
    queryComments: async (_, { postId, searchQuery = null, first = 15, after }, context) => {
      try {
        let search = {};
        let allComments = null;

        // Search USER tracks
        if (searchQuery && postId) {
          search = {
            $or: [
              { body: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allComments = await Comment.find(search).populate("likes").populate("author");
          allComments = allComments.filter((comment) => postId === comment.post.toString());
          allComments = allComments.reverse();
          // Search ALL tracks
        } else if (searchQuery) {
          search = {
            $or: [
              { body: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allComments = await Comment.find(search).populate("likes").populate("author");
          allComments = allComments.reverse();
          // Get USER tracks
        } else if (postId) {
          search = {
            $or: [
              { postId: postId }, // i means case insensitivity
            ],
          };
          allComments = await Comment.find(search).populate("likes").populate("author");
          allComments = allComments.reverse();
        }

        if (!allComments) throw new Error("No comments found.");

        const comments = paginatedResults({
          after,
          pageSize: first,
          results: allComments,
        });

        const edges = comments.map((comment) => {
          return {
            node: comment,
            cursor: comment.cursor,
          };
        });

        const commentConnection = {
          edges: edges,
          pageInfo: {
            endCursor: comments.length ? comments[comments.length - 1].cursor : null,
            hasNextPage: comments.length
              ? comments[comments.length - 1].cursor !==
                allComments[allComments.length - 1].cursor
              : false,
          },
        };
        return commentConnection;
      } catch (err) {
        throw new Error("Failed to get comments", err);
      }
    },
  },
};
