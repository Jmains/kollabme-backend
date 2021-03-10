const Album = require("../../models/Album");
const paginatedResults = require("../../utils/paginateResults");
const User = require("../../models/User");
const checkAuth = require("../../utils/check-auth");
const Track = require("../../models/Track");

module.exports = {
  Query: {
    queryAlbums: async (_, { username, searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allAlbums = null;

        // Search USER albums
        if (searchQuery && username) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allAlbums = await Album.find(search)
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "track",
              populate: {
                path: "likes",
              },
            });
          allAlbums = allAlbums.filter((album) => username === album.username);
          // Search ALL albums
        } else if (searchQuery) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allAlbums = await Album.find(search)
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "track",
              populate: {
                path: "likes",
              },
            });
          // Get USER albums
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allAlbums = await Album.find(search)
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "track",
              populate: {
                path: "likes",
              },
            });
        }
        if (!allAlbums) throw new Error("No albums found.");

        const albums = paginatedResults({
          after,
          pageSize: first,
          results: allAlbums,
        });

        const edges = albums.map((album) => {
          return {
            node: album,
            cursor: album.cursor,
          };
        });

        const albumConnection = {
          edges: edges,
          pageInfo: {
            endCursor: albums.length ? albums[albums.length - 1].cursor : null,
            hasNextPage: albums.length
              ? albums[albums.length - 1].cursor !== allAlbums[allAlbums.length - 1].cursor
              : false,
          },
        };
        return albumConnection;
      } catch (err) {
        throw new Error("Album connection failed: ", err);
      }
    },
    queryPublicAlbums: async (
      _,
      { username, searchQuery = null, first = 7, after },
      context
    ) => {
      try {
        let search = {};
        let allAlbums = null;

        // Search USER tracks
        if (searchQuery && username) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allAlbums = await Album.find(search)
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "tracks",
              populate: {
                path: "likes",
              },
            });
          allAlbums = allAlbums.filter(
            (album) => username === album.username && album.isPublic === true
          );
          // Search ALL tracks
        } else if (searchQuery) {
          search = {
            $or: [
              { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allAlbums = await Album.find(search)
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "tracks",
              populate: {
                path: "likes",
              },
            });
          allAlbums = allAlbums.filter((album) => album.isPublic === true);
          // Get USER tracks
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allAlbums = await Album.find(search)
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "tracks",
              populate: {
                path: "likes",
              },
            });
          allAlbums = allAlbums.filter((album) => album.isPublic === true);
        } else {
          allAlbums = await Album.find({})
            .populate("tracks")
            .populate("author")
            .populate("likes")
            .populate({
              path: "tracks",
              populate: {
                path: "likes",
              },
            });
          allAlbums = allAlbums.filter((album) => album.isPublic === true);
        }

        if (!allAlbums) throw new Error("No tracks found.");

        const albums = paginatedResults({
          after,
          pageSize: first,
          results: allAlbums,
        });

        const edges = albums.map((album) => {
          return {
            node: album,
            cursor: album.cursor,
          };
        });

        const albumConnection = {
          edges: edges,
          pageInfo: {
            endCursor: albums.length ? albums[albums.length - 1].cursor : null,
            hasNextPage: albums.length
              ? albums[albums.length - 1].cursor !== allAlbums[allAlbums.length - 1].cursor
              : false,
          },
        };
        return albumConnection;
      } catch (err) {
        throw new Error("Failed to get albums", err);
      }
    },
    getAlbum: async (_, { albumId }, context) => {
      try {
        const album = await Album.findById(albumId)
          .populate("tracks")
          .populate("author")
          .populate("likes")
          .populate({
            path: "track",
            populate: {
              path: "likes",
            },
          });
        if (!album) throw new Error("Album not found.");
        return album;
      } catch (err) {
        throw new Error("Failed to get album: ", err);
      }
    },
  },
  Mutation: {
    createAlbum: async (
      _,
      { albumInput: { title, coverImageUrl, tracks, isPublic = false } },
      context
    ) => {
      const { id, username } = checkAuth(context);
      try {
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        let album = new Album({
          title,
          coverImageUrl,
          isPublic,
          username,
          author: id,
          tracks: [],
          createdAt: new Date().toISOString(),
          cursor: new Date().toISOString(),
          likes: [],
          likeCount: 0,
        });

        tracks.forEach(async (track) => {
          try {
            const newTrack = new Track({
              album: album._id,
              title: track.title,
              author: id,
              username,
              artistName: track.artistName,
              imageUrl: track.imageUrl,
              audioUrl: track.audioUrl,
              isPublic: track.isPublic,
              createdAt: new Date().toISOString(),
              cursor: new Date().toISOString(),
              likes: [],
              likeCount: 0,
            });
            album.tracks.push(newTrack);
            user.tracks.push(newTrack);
            await newTrack.save();
          } catch (err) {
            throw new Error("Failed to add track to album: ", err);
          }
        });

        user.albums.push(album);
        user.save();
        const savedAlbum = await album.save();
        return savedAlbum;
      } catch (err) {
        throw new Error("Failed to create album: ", err);
      }
    },
    updateAlbum: async (
      _,
      { albumId, albumInput: { title, artistName, coverImageUrl, tracks, isPublic = false } },
      context
    ) => {
      checkAuth(context);
      try {
        const album = await Album.findById(albumId).populate("tracks");
        if (!album) throw new Error("Album not found.");

        const albumTracks = album.tracks;

        // albumTracks.forEach(track => {
        //   tracks.forEach(newTrack => {
        //     track.title: newTrack.title,
        //     track.artistName: newTrack.artistName,
        //     track.imageUrl: newTrack.imageUrl,
        //     track.audio: newTrack.audioUrl,
        //     track.isPublic: newTrack.isPublic,
        //   })
        // })

        album.title = title;
        album.artistName = artistName;
        album.coverImageUrl = coverImageUrl;
        album.tracks = tracks;
        album.isPublic = isPublic;

        const savedAlbum = await album.save();
        return savedAlbum;
      } catch (err) {
        throw new Error("Failed to update Album: ", err);
      }
    },
    deleteAlbum: async (_, { albumId }, context) => {
      const { id } = checkAuth(context);
      try {
        const albumToDelete = await Album.findById(albumId);
        if (!albumToDelete) throw new Error("Album to delete not found.");
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        if (user.albums.find((id) => id.toString() === albumId)) {
          await Track.deleteMany({ album: albumId });
          // Remove album from user album list
          user.albums = user.albums.filter((id) => id.toString() !== albumId);
          user.save();
          await Like.deleteMany({ album: albumId });
          // Delete Album
          albumToDelete.deleteOne();
          // Delete Album tracks

          return "Album successfully deleted";
        } else {
          throw new Error("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    likeAlbum: async (_, { albumId }, context) => {
      const { username, id } = checkAuth(context);
      try {
        const album = await Album.findById(albumId).populate("likes");
        if (!album) throw new Error("Album not found.");
        const user = await User.findById(id);
        if (!user) throw new Error("User not found");

        if (album.likes.find((like) => like.username === username)) {
          album.likes = album.likes.filter((like) => like.username !== username);
        } else {
          album.likes.push(user);
          album.likes.reverse();
        }
        await album.save();
        return album;
      } catch (err) {
        throw new Error("Failed to like album: ", err);
      }
    },
    makeAlbumPublic: async (_, { albumId }, context) => {
      checkAuth(context);
      try {
        const album = await Album.findById(albumId).populate("tracks");
        if (!album) throw new Error("Album not found.");
        const tracks = await Track.find({ album: albumId });
        if (album.isPublic === true) {
          album.isPublic = false;
          tracks.forEach(async (track) => {
            try {
              track.isPublic = false;
              await track.save();
            } catch (err) {
              throw new Error("Failed to save track: ", err);
            }
          });
        } else {
          album.isPublic = true;
          tracks.forEach(async (track) => {
            try {
              track.isPublic = true;
              await track.save();
            } catch (err) {
              throw new Error("Failed to save track: ", err);
            }
          });
        }
        await album.save();
        return album;
      } catch (err) {
        throw new Error("Failed to make album public: ", err);
      }
    },
  },
  Subscription: {},
};
