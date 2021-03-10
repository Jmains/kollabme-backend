const checkAuth = require("../../utils/check-auth");
const User = require("../../models/User");
const paginatedResults = require("../../utils/paginateResults");
const Like = require("../../models/Like");
const Video = require("../../models/Video");

module.exports = {
  Query: {
    queryVideos: async (_, { username, searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allVideos = null;

        // Search USER videos
        if (searchQuery && username) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };

          allVideos = await Video.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allVideos = allVideos.filter((video) => username === video.username);
          // Search ALL videos
        } else if (searchQuery) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allVideos = await Video.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          // Get USER videos
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allVideos = await Video.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
        }

        if (!allVideos) throw new Error("No tracks found.");

        const videos = paginatedResults({
          after,
          pageSize: first,
          results: allVideos,
        });

        const edges = videos.map((video) => {
          return {
            node: video,
            cursor: video.cursor,
          };
        });

        const videoConnection = {
          edges: edges,
          pageInfo: {
            endCursor: videos.length ? videos[videos.length - 1].cursor : null,
            hasNextPage: videos.length
              ? videos[videos.length - 1].cursor !== allVideos[allVideos.length - 1].cursor
              : false,
          },
        };
        return videoConnection;
      } catch (err) {
        throw new Error("Failed to get videos", err);
      }
    },
    queryPublicVideos: async (
      _,
      { username, searchQuery = null, first = 7, after },
      context
    ) => {
      try {
        let search = {};
        let allVideos = null;

        // Search USER tracks
        if (searchQuery && username) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allVideos = await Video.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allVideos = allVideos.filter(
            (video) => username === video.username && video.isPublic === true
          );
          // Search ALL tracks
        } else if (searchQuery) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allVideos = await Video.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allVideos = allVideos.filter((video) => video.isPublic === true);
          // Get USER videos
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allVideos = await Video.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allVideos = allVideos.filter((video) => video.isPublic === true);
        } else {
          allVideos = await Video.find({})
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allVideos = allVideos.filter((video) => video.isPublic === true);
        }

        if (!allVideos) throw new Error("No tracks found.");

        const videos = paginatedResults({
          after,
          pageSize: first,
          results: allVideos,
        });

        const edges = videos.map((video) => {
          return {
            node: video,
            cursor: video.cursor,
          };
        });

        const videoConnection = {
          edges: edges,
          pageInfo: {
            endCursor: videos.length ? videos[videos.length - 1].cursor : null,
            hasNextPage: videos.length
              ? videos[videos.length - 1].cursor !== allVideos[allVideos.length - 1].cursor
              : false,
          },
        };
        return videoConnection;
      } catch (err) {
        throw new Error("Failed to get public videos", err);
      }
    },
    getVideo: async (_, { videoId }) => {
      try {
        const video = await Video.findById(videoId)
          .populate("likes")
          .populate("author")
          .populate({
            path: "likes",
            populate: {
              path: "author",
            },
          });
        if (!video) throw new Error("video not found.");
        return video;
      } catch (err) {
        throw new Error("Failed to get video: ", err);
      }
    },
  },
  Mutation: {
    createVideo: async (
      _,
      { videoInput: { title, videoUrl, description, isPublic = false } },
      context
    ) => {
      const { id, username } = checkAuth(context);
      try {
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        const video = new Video({
          title,
          videoUrl,
          isPublic,
          description,
          author: user,
          username: username,
          createdAt: new Date().toISOString(),
          cursor: new Date().toISOString(),
          likes: [],
          likeCount: 0,
        });

        user.videos.push(video);
        user.save();
        const savedVideo = await video.save();
        return savedVideo;
      } catch (err) {
        throw new Error("Failed to create video: ", err);
      }
    },
    // updateVideo: async (
    //   _,
    //   { videoId, trackInput: { title, artistName, imageUrl, audioUrl, isPublic = false } },
    //   context
    // ) => {
    //   checkAuth(context);
    //   try {
    //     const track = await Video.findById(trackId);
    //     if (!track) throw new Error("Track not found.");

    //     track.title = title;
    //     track.artistName = artistName;
    //     track.imageUrl = imageUrl;
    //     track.audioUrl = audioUrl;
    //     track.isPublic = isPublic;

    //     const updatedTrack = await track.save();
    //     return updatedTrack;
    //   } catch (err) {
    //     throw new Error("Failed to update track: ", err);
    //   }
    // },
    deleteVideo: async (_, { videoId }, context) => {
      const { id } = checkAuth(context);
      try {
        const videoToDelete = await Video.findById(videoId);
        if (!videoToDelete) throw new Error("Video to delete not found.");
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        if (user.videos.find((id) => id.toString() === videoId)) {
          // Remove video from user videos list
          user.videos = user.videos.filter((id) => id.toString() !== videoId);
          await Like.deleteMany({ video: videoId });
          user.save();
          videoToDelete.deleteOne();
          return "Video successfully deleted";
        } else {
          throw new Error("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    likeVideo: async (_, { videoId }, context) => {
      const { username, id } = checkAuth(context);
      try {
        const video = await Video.findById(videoId)
          .populate("likes")
          .populate({
            path: "likes",
            populate: {
              path: "author",
            },
          });

        const user = await User.findOne({ username: username });
        if (!user) throw new Error("User not found.");
        if (video) {
          if (video.likes.find((like) => like.username === username)) {
            const likeToDelete = await Like.findOne({ author: id, video: videoId });
            await likeToDelete.deleteOne();
            video.likes = video.likes.filter((like) => like.username !== username);
            video.likeCount -= 1;
          } else {
            const like = new Like({
              author: user,
              username: username,
              video: video,
              createdAt: new Date().toISOString(),
              cursor: new Date().toISOString(),
            });
            video.likes.push(like);
            video.likes.reverse();
            video.likeCount += 1;
            await like.save();
          }

          await video.save();
          return video;
        }
      } catch (err) {
        throw new Error("Failed to like video: ", err);
      }
    },
    makeVideoPublic: async (_, { videoId }, context) => {
      checkAuth(context);
      try {
        const video = await Video.findById(videoId);
        if (!video) throw new Error("video not found");
        if (video.isPublic === true) {
          video.isPublic = false;
        } else {
          video.isPublic = true;
        }
        await video.save();
        return video;
      } catch (err) {
        throw new Error("Failed to make video public");
      }
    },
  },
};
