const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const postSchema = new Schema({
  // ID automatically added by mongodb so no need to add here
  body: {
    type: String,
    require: true,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  audioUrl: {
    type: String,
  },
  embeddedVideo: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  embeddedTrack: {
    type: Schema.Types.ObjectId,
    ref: "Track",
  },
  embeddedPainting: {
    type: Schema.Types.ObjectId,
    ref: "Painting",
  },
  embeddedAlbum: {
    type: Schema.Types.ObjectId,
    ref: "Album",
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "Like",
    },
  ],
  likeCount: {
    type: Number,
    default: 0,
  },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  createdAt: {
    type: String,
    required: true,
  },
  username: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  cursor: {
    type: String,
    required: true,
    default: "",
  },
});

module.exports = model("Post", postSchema);
