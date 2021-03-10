const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const notificationSchema = new Schema({
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    require: true,
  },
  isRead: {
    type: Boolean,
    default: false,
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

module.exports = model("Notification", notificationSchema);
