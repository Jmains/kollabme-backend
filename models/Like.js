const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const likeSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: {
    type: String,
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  commentReply: {
    type: Schema.Types.ObjectId,
    ref: "CommentReply",
  },
  track: {
    type: Schema.Types.ObjectId,
    ref: "Track",
  },
  painting: {
    type: Schema.Types.ObjectId,
    ref: "Painting",
  },
  album: {
    type: Schema.Types.ObjectId,
    ref: "Album",
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  createdAt: {
    type: String,
    required: true,
  },
  cursor: {
    type: String,
    default: "",
  },
});

module.exports = model("Like", likeSchema);
