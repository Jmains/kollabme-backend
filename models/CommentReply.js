const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const commentReplySchema = new Schema({
  commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: String,
  body: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
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

module.exports = model("CommentReply", commentReplySchema);
