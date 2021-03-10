const Chat = require("../../models/Chat");
const User = require("../../models/User");

module.exports = {
  Query: {
    getUserChats: async (_, { userId }, context) => {
      try {
        const user = await User.findById(userId).populate("chats");
        if (!user) throw new Error("No chats found");
        const populatedChatMessages = await user.populate("chats.messages").execPopulate();

        const populatedFinal = await populatedChatMessages
          .populate("chats.owner")
          .populate("chats.sendTo")
          .execPopulate();

        return populatedFinal.chats;
      } catch (error) {
        throw new Error(error);
      }
    },
    getChatMessages: async (_, { chatId }, context) => {
      try {
        const chat = await Chat.findById(chatId).populate({
          path: "messages",
          populate: {
            path: "sentBy recipient",
            model: "User",
          },
        });
        if (!chat) throw new Error("Chat not found");
        return chat.messages;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    createNewChat: async (_, { userId, userToChatWithId }, context) => {
      try {
        const user = await User.findById(userId);
        console.log(user._doc);
        const userToChatWith = await User.findById(userToChatWithId);
        if (!user) throw new Error("User not found");
        if (!userToChatWith) throw new Error("User you requested to chat with not found");

        const chat = new Chat({
          owner: userId,
          sendTo: userToChatWithId,
          createdAt: new Date().toISOString(),
          messages: [],
        });
        // Push chat to both users chats array
        user.chats.push(chat);
        userToChatWith.chats.push(chat);
        // Save both to db
        user.save();
        userToChatWith.save();
        await chat.save();

        const populatedChat = await Chat.findById({ _id: chat._id })
          .populate({
            path: "messages",
            populate: {
              path: "sentBy recipient",
              model: "User",
            },
          })
          .populate("owner")
          .populate("sendTo");

        return populatedChat;
      } catch (error) {
        throw new Error("Failed to create chat");
      }
    },
  },
  Subscription: {},
};
