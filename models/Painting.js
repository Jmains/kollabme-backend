const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const paintingSchema = new Schema({
  title: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  username: String,
  description: String,
  imageUrl: String,
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
// paintingSchema.index({ author: "text" });

module.exports = model("Painting", paintingSchema);
