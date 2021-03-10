const { model, Schema } = require("mongoose");
const Like = require("./Like");
// TODO: Migrate to Postgres and add more strict validation
const trackSchema = new Schema({
  album: {
    type: Schema.Types.ObjectId,
    ref: "Album",
  },
  title: String,
  artistName: String,
  username: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  imageUrl: String,
  audioUrl: String,
  isPublic: Boolean,
  createdAt: String,
  cursor: {
    type: String,
    required: true,
    default: "",
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
});

trackSchema.pre("remove", function (next) {
  console.log(" middle ware");
  Like.remove({ track: trackSchema._id }).exec();
  next();
});

// trackSchema.index({ author: "text" });

module.exports = model("Track", trackSchema);
