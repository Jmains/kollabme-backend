const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const commentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: String,
  body: {
    type: String,
    trim: true,
    require: true,
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Post",
  },
  replies: [
    {
      type: Schema.Types.ObjectId,
      ref: "CommentReply",
    },
  ],
  replyCount: {
    type: Number,
    default: 0,
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
  cursor: {
    type: String,
    required: true,
    default: "",
  },
  createdAt: {
    type: String,
    required: true,
  },
});

module.exports = model("Comment", commentSchema);
