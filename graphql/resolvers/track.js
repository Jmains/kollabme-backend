const Track = require("../../models/Track");
const checkAuth = require("../../utils/check-auth");
const User = require("../../models/User");
const paginatedResults = require("../../utils/paginateResults");
const Album = require("../../models/Album");
const Like = require("../../models/Like");

module.exports = {
  Query: {
    queryTracks: async (_, { username, searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allTracks = null;

        // Search a specific USERs tracks
        if (searchQuery && username) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allTracks = await Track.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.filter((track) => username === track.username);
          allTracks = allTracks.reverse();
          // Search ALL tracks
        } else if (searchQuery) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allTracks = await Track.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.reverse();
          // Get USER tracks
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allTracks = await Track.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.reverse();
        }

        if (!allTracks) throw new Error("No tracks found.");

        const tracks = paginatedResults({
          after,
          pageSize: first,
          results: allTracks,
        });

        const edges = tracks.map((track) => {
          return {
            node: track,
            cursor: track.cursor,
          };
        });

        const trackConnection = {
          edges: edges,
          pageInfo: {
            endCursor: tracks.length ? tracks[tracks.length - 1].cursor : null,
            hasNextPage: tracks.length
              ? tracks[tracks.length - 1].cursor !== allTracks[allTracks.length - 1].cursor
              : false,
          },
        };
        return trackConnection;
      } catch (err) {
        throw new Error("Failed to get tracks", err);
      }
    },
    queryPublicTracks: async (
      _,
      { username, searchQuery = null, first = 7, after },
      context
    ) => {
      try {
        let search = {};
        let allTracks = null;

        // Search USER tracks
        if (searchQuery && username) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allTracks = await Track.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.filter(
            (track) => username === track.username && track.isPublic === true
          );
          allTracks = allTracks.reverse();
          // Search ALL tracks
        } else if (searchQuery) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allTracks = await Track.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.filter((track) => track.isPublic === true);
          allTracks = allTracks.reverse();
          // Get USER tracks
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allTracks = await Track.find(search)
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.filter((track) => track.isPublic === true);
          allTracks = allTracks.reverse();
        } else {
          allTracks = await Track.find({})
            .populate("likes")
            .populate("author")
            .populate({
              path: "likes",
              populate: {
                path: "author",
              },
            });
          allTracks = allTracks.filter((track) => track.isPublic === true);
          allTracks = allTracks.reverse();
        }

        if (!allTracks) throw new Error("No tracks found.");

        const tracks = paginatedResults({
          after,
          pageSize: first,
          results: allTracks,
        });

        const edges = tracks.map((track) => {
          return {
            node: track,
            cursor: track.cursor,
          };
        });

        const trackConnection = {
          edges: edges,
          pageInfo: {
            endCursor: tracks.length ? tracks[tracks.length - 1].cursor : null,
            hasNextPage: tracks.length
              ? tracks[tracks.length - 1].cursor !== allTracks[allTracks.length - 1].cursor
              : false,
          },
        };
        return trackConnection;
      } catch (err) {
        throw new Error("Failed to get tracks", err);
      }
    },
    getTrack: async (_, { trackId }) => {
      try {
        const track = await Track.findById(trackId)
          .populate("likes")
          .populate("author")
          .populate({
            path: "likes",
            populate: {
              path: "author",
            },
          });
        if (!track) throw new Error("Track not found.");
        return track;
      } catch (err) {
        throw new Error("Failed to get track: ", err);
      }
    },
  },
  Mutation: {
    createTrack: async (
      _,
      { trackInput: { title, artistName, imageUrl, audioUrl, isPublic = false } },
      context
    ) => {
      const { id, username } = checkAuth(context);
      try {
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");
        if (!imageUrl) {
          imageUrl = "https://intreecate.s3-us-west-1.amazonaws.com/usplash.jpg";
        }

        const track = new Track({
          title,
          artistName,
          imageUrl,
          audioUrl,
          isPublic,
          author: user,
          username: username,
          createdAt: new Date().toISOString(),
          cursor: new Date().toISOString(),
          likes: [],
          likeCount: 0,
        });

        user.tracks.push(track);
        user.save();
        const savedTrack = await track.save();
        return savedTrack;
      } catch (err) {
        throw new Error("Failed to create track: ", err);
      }
    },
    updateTrack: async (
      _,
      { trackId, trackInput: { title, artistName, imageUrl, audioUrl, isPublic = false } },
      context
    ) => {
      checkAuth(context);
      try {
        const track = await Track.findById(trackId);
        if (!track) throw new Error("Track not found.");

        track.title = title;
        track.artistName = artistName;
        track.imageUrl = imageUrl;
        track.audioUrl = audioUrl;
        track.isPublic = isPublic;

        const updatedTrack = await track.save();
        return updatedTrack;
      } catch (err) {
        throw new Error("Failed to update track: ", err);
      }
    },
    deleteTrack: async (_, { trackId }, context) => {
      const { id } = checkAuth(context);
      try {
        const trackToDelete = await Track.findById(trackId);
        if (!trackToDelete) throw new Error("Track to delete not found.");
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        if (user.tracks.find((id) => id.toString() === trackId)) {
          // Remove track from user tracks list

          user.tracks = user.tracks.filter((id) => id.toString() !== trackId);
          await Like.deleteMany({ track: trackId });

          if (trackToDelete.album) {
            const albumId = trackToDelete.album.toString();
            const album = await Album.findById(albumId);
            if (!album) throw new Error("Album to delete track from not found.");
            album.tracks = album.tracks.filter((album) => album.toString() !== trackId);

            if (album.tracks.length === 0) {
              user.albums = user.albums.filter((id) => id.toString() !== albumId);
              await album.deleteOne();
            } else {
              album.save();
            }
          }
          user.save();
          trackToDelete.deleteOne();
          return "Track successfully deleted";
        } else {
          throw new Error("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    likeTrack: async (_, { trackId }, context) => {
      const { username, id } = checkAuth(context);
      try {
        const track = await Track.findById(trackId)
          .populate("likes")
          .populate({
            path: "likes",
            populate: {
              path: "author",
            },
          });

        const user = await User.findOne({ username: username });
        if (!user) throw new Error("User not found.");
        if (track) {
          if (track.likes.find((like) => like.username === username)) {
            const likeToDelete = await Like.findOne({ author: id, track: trackId });
            await likeToDelete.deleteOne();
            track.likes = track.likes.filter((like) => like.username !== username);
            track.likeCount -= 1;
          } else {
            const like = new Like({
              author: user,
              username: username,
              track: track,
              createdAt: new Date().toISOString(),
              cursor: new Date().toISOString(),
            });
            track.likes.push(like);
            track.likes.reverse();
            track.likeCount += 1;
            await like.save();
          }

          await track.save();
          return track;
        }
      } catch (err) {
        throw new Error("Failed to like track: ", err);
      }
    },
    makeTrackPublic: async (_, { trackId }, context) => {
      checkAuth(context);
      try {
        const track = await Track.findById(trackId);
        if (!track) throw new Error("Track not found");
        if (track.isPublic === true) {
          track.isPublic = false;
        } else {
          track.isPublic = true;
        }
        await track.save();
        return track;
      } catch (err) {
        throw new Error("Failed to make track public");
      }
    },
  },
};
