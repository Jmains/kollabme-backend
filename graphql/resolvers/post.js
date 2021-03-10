const Post = require("../../models/Post");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const checkAuth = require("../../utils/check-auth");
const { AuthenticationError, UserInputError } = require("apollo-server");
const paginatedResults = require("../../utils/paginateResults");
const { deleteS3Object } = require("../../utils/deleteS3Object");
const Like = require("../../models/Like");
const Notification = require("../../models/Notification");

module.exports = {
  Query: {
    queryPosts: async (_, { username, searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allPosts = null;

        // Search USER posts
        if (searchQuery && username) {
          search = {
            $or: [
              { body: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allPosts = await Post.find(search).populate("author").populate("likes");
          allPosts = allPosts.reverse();
          allPosts = allPosts.filter((post) => username === post.author.username);
          // Get USER posts
        } else if (username) {
          // search = {
          //   $or: [{ author: username }],
          // };
          allPosts = await Post.find({}).populate("author").populate("likes");
          allPosts = allPosts.reverse();
          allPosts = allPosts.filter((post) => username === post.author.username);
        }
        // Search ALL posts
        else if (searchQuery) {
          search = {
            $or: [
              { body: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allPosts = await Post.find(search).populate("author").populate("likes");
          allPosts.reverse();
        }
        // Get ALL posts
        else {
          allPosts = await Post.find({}).populate("author").populate("likes");
          allPosts = allPosts.reverse();
        }

        if (!allPosts) throw new Error("No posts found.");

        const posts = paginatedResults({
          after,
          pageSize: first,
          results: allPosts,
        });

        const edges = posts.map((post) => {
          return {
            node: post,
            cursor: post.cursor,
          };
        });

        const postConnection = {
          edges: edges,
          pageInfo: {
            endCursor: posts.length ? posts[posts.length - 1].cursor : null,
            hasNextPage: posts.length
              ? posts[posts.length - 1].cursor !== allPosts[allPosts.length - 1].cursor
              : false,
          },
        };
        return postConnection;
      } catch (err) {
        throw new Error("Failed to get posts", err);
      }
    },

    // GET SINGLE POST
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId)
          .populate("author")
          .populate("comments")
          .populate("likes");
        if (post) {
          return post;
        } else {
          throw new Error("Post has been deleted.");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    // CREATE POST
    async createPost(_, { userId, body, imageUrl, videoUrl, audioUrl }, context) {
      const { id, username } = checkAuth(context);
      if (body.trim() === "") {
        throw new Error("Post body must not be empty.");
      }
      const currentTime = new Date().toISOString();
      try {
        // Find user and update createdPosts field with postId
        const userModel = await User.findById({ _id: userId });
        if (!userModel) throw new Error("User not found.");

        const newPost = new Post({
          body,
          author: id,
          username: username,
          createdAt: currentTime,
          imageUrl: imageUrl,
          videoUrl: videoUrl,
          audioUrl: audioUrl,
          cursor: currentTime,
        });
        const post = await newPost.save();
        const populatedPost = await Post.findById(newPost._id).populate("author");
        if (!populatedPost) throw new Error("Populated post not found");

        // Populate by most recent post
        userModel.createdPosts.unshift(post);
        await userModel.save();
        return populatedPost;
      } catch (error) {
        throw new Error(error);
      }
    },
    // DELETE POST
    async deletePost(_, { postId }, context) {
      const { id } = checkAuth(context);
      try {
        const user = await User.findById(id);
        if (!user) throw new Error("User does not exist.");
        const post = await Post.findById(postId).populate("author");
        if (!post) throw new Error("Post not found.");

        if (user.username === post.author.username) {
          if (user.createdPosts.find((id) => id.toString() === postId)) {
            user.createdPosts = user.createdPosts.filter((id) => id.toString() !== postId);
            if (post.imageUrl) {
              await deleteS3Object(post.imageUrl);
              console.log("deleteing image");
            } else if (post.videoUrl) {
              await deleteS3Object(post.videoUrl);
            }

            await Like.deleteMany({ post: postId });

            user.save();
            Comment.deleteMany({ post: postId });
            post.deleteOne();

            return "Post successfully deleted.";
          }
        } else {
          throw new AuthenticationError("Action not allowed.");
        }
      } catch (error) {
        throw new Error(error);
      }
    },
    // LIKE A POST
    async likePost(_, { postId }, context) {
      // Like has postId and author, username, createdAt
      const { username, id } = checkAuth(context);
      const post = await Post.findById(postId).populate("likes").populate("author");
      if (post) {
        if (post.likes.find((like) => like.username === username)) {
          const likeToDelete = await Like.findOne({ username: username, post: postId });
          await likeToDelete.deleteOne();
          post.likeCount -= 1;
          // Post already liked, unlike it
          post.likes = post.likes.filter((like) => like.username !== username);
          await Notification.findOneAndDelete({ author: id, post: postId });
        } else {
          const like = new Like({
            author: id,
            username: username,
            post: post,
            createdAt: new Date().toISOString(),
            cursor: new Date().toISOString(),
          });
          // Not liked, like post
          post.likes.push(like);
          post.likes.reverse();
          post.likeCount += 1;
          const notification = new Notification({
            createdAt: new Date().toISOString(),
            message: `${username} liked one of your posts.`,
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

          await like.save();
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found.");
      }
    },
  },
};
