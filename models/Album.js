const { model, Schema } = require("mongoose");

// TODO: Migrate to Postgres and add more strict validation

const albumSchema = new Schema({
  title: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: String,
  coverImageUrl: String,
  tracks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Track",
    },
  ],
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
// albumSchema.index({ author: "text" });
module.exports = model("Album", albumSchema);
