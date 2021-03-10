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
    createCommentReply: async (_, { commentId, body }, context) => {
      // If check passes then we've logged in
      const { id, username } = checkAuth(context);
      if (body.trim() === "") {
        throw new UserInputError("Empty comment", {
          errors: {
            body: "Comment body must not be empty.",
          },
        });
      }
      const comment = await Comment.findById(commentId);

      if (comment) {
        try {
          const newCommentReply = new CommentReply({
            author: id,
            commentId: comment._id,
            body,
            username,
            createdAt: new Date().toISOString(),
            likes: [],
            likeCount: 0,
            cursor: new Date().toISOString(),
          });
          comment.replies.unshift(newCommentReply);
          comment.replyCount += 1;
          const notification = new Notification({
            createdAt: new Date().toISOString(),
            message: `${username} replied to one of your comments.`,
            sender: id,
            recipient: comment.author,
            type: "NEW_LIKE",
            postId: comment.postId.toString(),
            isRead: false,
            cursor: new Date().toISOString(),
          });

          // pubsub.publish(NEW_NOTIFICATION, {
          //   newNotification: notification,
          // });

          await notification.save();
          await newCommentReply.save();
          await comment.save();
          const poppedCommentReply = await CommentReply.findById(newCommentReply._id)
            .populate("author")
            .populate("likes");
          return poppedCommentReply;
        } catch (error) {
          throw new Error("Failed to create comment reply");
        }
      } else {
        throw new UserInputError("Comment not found.");
      }
    },
    deleteCommentReply: async (_, { commentId, commentReplyId }, context) => {
      const { id } = checkAuth(context);
      const comment = await Comment.findById(commentId).populate("replies");
      if (comment) {
        const commentReply = await CommentReply.findById(commentReplyId);
        if (!commentReply) throw new Error("Comment reply not found");
        const commentReplyIndex = comment.replies.findIndex(
          (reply) => reply._id.toString() === commentReplyId
        );
        if (comment.replies[commentReplyIndex].author.toString() === id) {
          comment.replies.splice(commentReplyIndex, 1);
          await Like.deleteMany({ commentReply: commentReplyId });
          commentReply.deleteOne();
          await comment.save();
          return "Comment reply deleted.";
        } else {
          throw new AuthenticationError("Action not allowed.");
        }
      } else {
        throw new UserInputError("Post not found.");
      }
    },
    likeCommentReply: async (_, { commentReplyId, commentId }, context) => {
      const { username, id } = checkAuth(context);
      try {
        const commentReply = await CommentReply.findById(commentReplyId).populate("likes");
        if (commentReply) {
          if (commentReply.likes.find((like) => like.username === username)) {
            const likeToDelete = await Like.findOne({
              username: username,
              commentReply: commentReplyId,
            });
            await likeToDelete.deleteOne();

            commentReply.likes = commentReply.likes.filter(
              (like) => like.username !== username
            );
            commentReply.likeCount -= 1;
          } else {
            const like = new Like({
              author: id,
              username: username,
              commentReply: commentReply,
              comment: commentId,
              createdAt: new Date().toISOString(),
              cursor: new Date().toISOString(),
            });
            commentReply.likes.push(like);
            commentReply.likes.reverse();
            commentReply.likeCount += 1;
            await like.save();
          }
          await commentReply.save();
          return commentReply;
        }
      } catch (err) {
        throw new Error("Failed to like commentReply: ", err);
      }
    },
  },
  Query: {
    queryCommentReplies: async (
      _,
      { commentId, searchQuery = null, first = 15, after },
      context
    ) => {
      try {
        let search = {};
        let allCommentReplies = null;

        // Search USER tracks
        if (searchQuery && commentId) {
          search = {
            $or: [
              { body: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allCommentReplies = await CommentReply.find(search)
            .populate("likes")
            .populate("author");
          allCommentReplies = allCommentReplies.filter(
            (commentRep) => commentId === commentRep.post.toString()
          );
          allCommentReplies = allCommentReplies.reverse();
          // Search ALL tracks
        } else if (searchQuery) {
          search = {
            $or: [
              { body: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allCommentReplies = await CommentReply.find(search)
            .populate("likes")
            .populate("author");
          allCommentReplies = allCommentReplies.reverse();
          // Get USER tracks
        } else if (commentId) {
          search = {
            $or: [
              { commentId: commentId }, // i means case insensitivity
            ],
          };
          allCommentReplies = await CommentReply.find(search)
            .populate("likes")
            .populate("author");
          allCommentReplies = allCommentReplies.reverse();
        }

        if (!allCommentReplies) throw new Error("No comment replies found.");

        const commentReplies = paginatedResults({
          after,
          pageSize: first,
          results: allCommentReplies,
        });

        const edges = commentReplies.map((commentRep) => {
          return {
            node: commentRep,
            cursor: commentRep.cursor,
          };
        });

        const commentReplyConnection = {
          edges: edges,
          pageInfo: {
            endCursor: commentReplies.length
              ? commentReplies[commentReplies.length - 1].cursor
              : null,
            hasNextPage: commentReplies.length
              ? commentReplies[commentReplies.length - 1].cursor !==
                allCommentReplies[allCommentReplies.length - 1].cursor
              : false,
          },
        };
        return commentReplyConnection;
      } catch (err) {
        throw new Error("Failed to get comment replies", err);
      }
    },
  },
};
