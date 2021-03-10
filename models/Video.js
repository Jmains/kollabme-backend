const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const videoSchema = new Schema({
  title: String,
  description: String,
  username: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  videoUrl: String,
  isPublic: {
    type: Boolean,
    default: false,
  },
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

module.exports = model("Video", videoSchema);
