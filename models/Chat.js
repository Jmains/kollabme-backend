const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation

const chatSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: String,
    required: true,
  },
  sendTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  messages: [
    {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  ],
});

module.exports = model("Chat", chatSchema);
