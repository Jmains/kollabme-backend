const { model, Schema } = require("mongoose");

// TODO: Migrate to Postgres and add more strict validation
const messageSchema = new Schema({
  sentBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: String,
    required: true,
  },
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  body: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  cursor: {
    type: String,
    default: "",
  },
});

module.exports = model("Message", messageSchema);
