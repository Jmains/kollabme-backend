const Like = require("../../models/Like");
const Painting = require("../../models/Painting");
const User = require("../../models/User");
const checkAuth = require("../../utils/check-auth");
const paginatedResults = require("../../utils/paginateResults");

module.exports = {
  Query: {
    queryPaintings: async (_, { username, searchQuery, first = 7, after }, context) => {
      try {
        let search = {};
        let allPaintings = null;

        if (searchQuery && username) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allPaintings = await Painting.find(search).populate("likes").populate("author");
          allPaintings = allPaintings.filter((painting) => username === painting.username);
          allPaintings = allPaintings.reverse();
        } else if (searchQuery) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allPaintings = await Painting.find(search).populate("likes").populate("author");
          allPaintings = allPaintings.reverse();
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allPaintings = await Painting.find(search).populate("likes").populate("author");
          allPaintings = allPaintings.reverse();
        }
        if (!allPaintings) throw new Error("No paintings found.");

        const paintings = paginatedResults({
          after,
          pageSize: first,
          results: allPaintings,
        });

        const edges = paintings.map((painting) => {
          return {
            node: painting,
            cursor: painting.cursor,
          };
        });

        const paintingConnection = {
          edges: edges,
          pageInfo: {
            endCursor: paintings.length ? paintings[paintings.length - 1].cursor : null,
            hasNextPage: paintings.length
              ? paintings[paintings.length - 1].cursor !==
                allPaintings[allPaintings.length - 1].cursor
              : false,
          },
        };
        return paintingConnection;
      } catch (err) {
        throw new Error("Painting connection failed: ", err);
      }
    },

    queryPublicPaintings: async (_, { username, searchQuery, first = 7, after }, context) => {
      try {
        let search = {};
        let allPaintings = null;

        if (searchQuery && username) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allPaintings = await Painting.find(search).populate("likes").populate("author");
          allPaintings = allPaintings.filter((painting) => username === painting.username);
          allPaintings = allPaintings.filter((painting) => painting.isPublic === true);
          allPaintings = allPaintings.reverse();
        } else if (searchQuery) {
          search = {
            $or: [
              { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { title: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allPaintings = await Painting.find(search).populate("likes").populate("author");
          allPaintings = allPaintings.filter((painting) => painting.isPublic === true);
          allPaintings = allPaintings.reverse();
        } else if (username) {
          search = {
            $or: [{ username: username }],
          };
          allPaintings = await Painting.find(search).populate("likes").populate("author");
          allPaintings = allPaintings.filter((painting) => painting.isPublic === true);
          allPaintings = allPaintings.reverse();
        } else {
          allPaintings = await Painting.find({}).populate("likes").populate("author");
          allPaintings = allPaintings.filter((painting) => painting.isPublic === true);
          allPaintings = allPaintings.reverse();
        }
        if (!allPaintings) throw new Error("No public paintings found.");

        const paintings = paginatedResults({
          after,
          pageSize: first,
          results: allPaintings,
        });

        const edges = paintings.map((painting) => {
          return {
            node: painting,
            cursor: painting.cursor,
          };
        });

        const paintingConnection = {
          edges: edges,
          pageInfo: {
            endCursor: paintings.length ? paintings[paintings.length - 1].cursor : null,
            hasNextPage: paintings.length
              ? paintings[paintings.length - 1].cursor !==
                allPaintings[allPaintings.length - 1].cursor
              : false,
          },
        };
        return paintingConnection;
      } catch (err) {
        throw new Error("Painting connection failed: ", err);
      }
    },

    getPainting: async (_, { paintingId }, context) => {
      try {
        const painting = await Painting.findById(paintingId)
          .populate("likes")
          .populate("author");
        if (!painting) throw new Error("Painting not found.");
        return painting;
      } catch (err) {
        throw new Error("Failed to get painting: ", err);
      }
    },
  },
  Mutation: {
    createPainting: async (
      _,
      { paintingInput: { title, description, imageUrl, isPublic = false } },
      context
    ) => {
      const { id, username } = checkAuth(context);
      try {
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        const painting = new Painting({
          title,
          imageUrl,
          description,
          isPublic,
          author: user,
          username: username,
          createdAt: new Date().toISOString(),
          cursor: new Date().toISOString(),
          likes: [],
          likeCount: 0,
        });

        user.paintings.push(painting);
        user.save();
        const savedPainting = await painting.save();
        return savedPainting;
      } catch (err) {
        throw new Error("Failed to create painting: ", err);
      }
    },
    updatePainting: async (
      _,
      {
        paintingId,
        paintingInput: { title, artistName, description, imageUrl, isPublic = false },
      },
      context
    ) => {
      checkAuth(context);
      try {
        const painting = await Painting.findById(paintingId);
        if (!painting) throw new Error("Painting not found.");

        painting.title = title;
        painting.artistName = artistName;
        painting.imageUrl = imageUrl;
        painting.description = description;
        painting.isPublic = isPublic;

        const savedPainting = await painting.save();
        return savedPainting;
      } catch (err) {
        throw new Error("Failed to update painting: ", err);
      }
    },
    deletePainting: async (_, { paintingId }, context) => {
      const { id } = checkAuth(context);
      try {
        const paintingToDelete = await Painting.findById(paintingId);
        if (!paintingToDelete) throw new Error("Painting to delete not found.");
        const user = await User.findById(id);
        if (!user) throw new Error("User not found.");

        if (user.paintings.find((id) => id.toString() === paintingId)) {
          // Remove painting from user paintings list
          user.paintings = user.paintings.filter((id) => id.toString() !== paintingId);
          await Like.deleteMany({ painting: paintingId });
          user.save();
          paintingToDelete.deleteOne();
          return "Painting successfully deleted";
        } else {
          throw new Error("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
    likePainting: async (_, { paintingId }, context) => {
      const { username } = checkAuth(context);
      try {
        const painting = await Painting.findById(paintingId).populate("likes");
        const user = await User.findOne({ username: username });
        if (!user) throw new Error("User not found.");
        if (painting) {
          if (painting.likes.find((like) => like.username === username)) {
            const likeToDelete = await Like.findOne({
              username: username,
              painting: paintingId,
            });
            await likeToDelete.deleteOne();
            painting.likes = painting.likes.filter((like) => like.username !== username);
            painting.likeCount -= 1;
          } else {
            const like = new Like({
              author: user,
              username: username,
              painting: painting,
              createdAt: new Date().toISOString(),
              cursor: new Date().toISOString(),
            });
            painting.likes.push(like);
            painting.likes.reverse();
            painting.likeCount += 1;
            await like.save();
          }
          await painting.save();
          return painting;
        }
      } catch (err) {
        throw new Error("Failed to like painting: ", err);
      }
    },
    makePaintingPublic: async (_, { paintingId }, context) => {
      checkAuth(context);
      try {
        const painting = await Painting.findById(paintingId);
        if (!painting) throw new Error("Painting not found");
        if (painting.isPublic === true) {
          painting.isPublic = false;
        } else {
          painting.isPublic = true;
        }
        await painting.save();
        return painting;
      } catch (err) {
        throw new Error("Failed to make painting public");
      }
    },
  },
};
