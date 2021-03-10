const Like = require("../../models/Like");
const paginatedResults = require("../../utils/paginateResults");

module.exports = {
  Query: {
    queryPostLikes: async (_, { postId, first = 7, after }, context) => {
      try {
        let allPostLikes = null;
        allPostLikes = await Like.find({ post: postId }).populate("author");
        allPostLikes = allPostLikes.reverse();

        if (!allPostLikes) throw new Error("No posts found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allPostLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !== allPostLikes[allPostLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get post likes", err);
      }
    },
    queryCommentLikes: async (_, { commentId, first = 7, after }, context) => {
      try {
        let allCommentLikes = null;
        allCommentLikes = await Like.find({ comment: commentId }).populate("author");
        allCommentLikes = allCommentLikes.reverse();

        if (!allCommentLikes) throw new Error("No comment likes found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allCommentLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !==
                allCommentLikes[allCommentLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get comment likes", err);
      }
    },
    queryCommentReplyLikes: async (_, { commentReplyId, first = 7, after }, context) => {
      try {
        let allCommentReplyLikes = null;
        allCommentReplyLikes = await Like.find({ commentReply: commentReplyId }).populate(
          "author"
        );
        allCommentReplyLikes = allCommentReplyLikes.reverse();

        if (!allCommentReplyLikes) throw new Error("No comment reply likes found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allCommentReplyLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !==
                allCommentReplyLikes[allCommentReplyLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get comment reply likes", err);
      }
    },
    queryTrackLikes: async (_, { trackId, first = 7, after }, context) => {
      try {
        let allTrackLikes = null;
        allTrackLikes = await Like.find({ track: trackId }).populate("author");
        allTrackLikes = allTrackLikes.reverse();

        if (!allTrackLikes) throw new Error("No track likes found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allTrackLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !==
                allTrackLikes[allTrackLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get track likes", err);
      }
    },
    queryPaintingLikes: async (_, { paintingId, first = 7, after }, context) => {
      try {
        let allPaintingLikes = null;
        allPaintingLikes = await Like.find({ painting: paintingId }).populate("author");
        allPaintingLikes = allPaintingLikes.reverse();

        if (!allPaintingLikes) throw new Error("No painting likes found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allPaintingLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !==
                allPaintingLikes[allPaintingLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get painting likes", err);
      }
    },
    queryAlbumLikes: async (_, { albumId, first = 7, after }, context) => {
      try {
        let allAlbumLikes = null;
        allAlbumLikes = await Like.find({ album: albumId }).populate("author");
        allAlbumLikes = allAlbumLikes.reverse();

        if (!allAlbumLikes) throw new Error("No album likes found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allAlbumLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !==
                allAlbumLikes[allAlbumLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get album likes", err);
      }
    },
    queryVideoLikes: async (_, { videoId, first = 7, after }, context) => {
      try {
        let allVideoLikes = null;
        allVideoLikes = await Like.find({ video: videoId }).populate("author");
        allVideoLikes = allVideoLikes.reverse();

        if (!allVideoLikes) throw new Error("No video likes found.");

        const likes = paginatedResults({
          after,
          pageSize: first,
          results: allVideoLikes,
        });

        const edges = likes.map((like) => {
          return {
            node: like,
            cursor: like.cursor,
          };
        });

        const likeConnection = {
          edges: edges,
          pageInfo: {
            endCursor: likes.length ? likes[likes.length - 1].cursor : null,
            hasNextPage: likes.length
              ? likes[likes.length - 1].cursor !==
                allVideoLikes[allVideoLikes.length - 1].cursor
              : false,
          },
        };
        return likeConnection;
      } catch (err) {
        throw new Error("Failed to get video likes", err);
      }
    },
  },
};
