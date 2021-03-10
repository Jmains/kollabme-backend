const { withFilter } = require("apollo-server");
const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const pubsub = require("../../utils/pubsub");
const checkAuth = require("../../utils/check-auth");
const paginatedResults = require("../../utils/paginateResults");

const NEW_CHAT_MESSAGE = "NEW_CHAT_MESSAGE";
module.exports = {
  Query: {
    getMessages: async (_, { chatId }, context) => {
      try {
        const chat = await Chat.findById(chatId).populate("messages");

        if (!chat) throw new Error("No chat found.");

        const allMessages = chat.messages;
        return allMessages;
      } catch (error) {
        throw new Error(error);
      }
    },
    queryMessages: async (_, { chatId, searchQuery = null, first = 20, after }, context) => {
      //checkAuth(context);
      try {
        let search = {};
        let allMessages = null;

        // Search USER messages
        if (searchQuery && chatId) {
          search = {
            $or: [
              { owner: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { sendTo: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allMessages = await Chat.find(search).populate("messages");
          allMessages = allMessages.filter((chat) => chatId === chat.id);
          allMessages = allMessages.messages;
          // Search ALL messages
        } else if (searchQuery) {
          search = {
            $or: [
              { owner: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { sendTo: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allMessages = await Chat.find(search).populate("messages");
          allMessages = allMessages.messages;
          // Get USER messages
        } else if (chatId) {
          allMessages = await Chat.findById(chatId)
            .populate("messages")
            .populate({
              path: "messages",
              populate: {
                path: "recipient sentBy",
              },
            });
          allMessages = allMessages.messages;
        }

        if (!allMessages) throw new Error("No messages found.");

        const messages = paginatedResults({
          after,
          pageSize: first,
          results: allMessages,
        });

        const edges = messages.map((msg) => {
          return {
            node: msg,
            cursor: msg.cursor,
          };
        });

        const messageConnection = {
          edges: edges,
          pageInfo: {
            endCursor: messages.length ? messages[messages.length - 1].cursor : null,
            hasNextPage: messages.length
              ? messages[messages.length - 1].cursor !==
                allMessages[allMessages.length - 1].cursor
              : false,
          },
        };
        return messageConnection;
      } catch (err) {
        throw new Error("Failed to get messages", err);
      }
    },
  },
  Mutation: {
    createMessage: async (_, { chatId, userId, userToChatWithId, body }, context) => {
      try {
        const chat = await Chat.findById(chatId);
        const message = new Message({
          sentBy: userId,
          recipient: userToChatWithId,
          body: body,
          imageUrl: "",
          createdAt: new Date().toISOString(),
          cursor: new Date().toISOString(),
        });

        chat.messages.push(message);
        chat.save();
        await message.save();

        const populatedMessage = await Chat.findById(chatId)
          .populate("messages")
          .populate({
            path: "messages",
            populate: {
              path: "recipient sentBy",
            },
          });

        const recentMsg = populatedMessage.messages.reverse()[0];

        pubsub.publish(NEW_CHAT_MESSAGE, {
          chatId: chatId,
          newChatMessage: {
            ...recentMsg._doc,
            id: recentMsg._id,
            sentBy: { ...recentMsg.sentBy._doc, id: recentMsg.sentBy._id },
            recipient: {
              ...recentMsg.recipient._doc,
              id: recentMsg.recipient._id,
            },
            body: recentMsg.body,
            createdAt: recentMsg.createdAt,
            cursor: recentMsg.cursor,
            imageUrl: recentMsg.imageUrl,
          },
        });

        return populatedMessage;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Subscription: {
    newChatMessage: {
      subscribe: withFilter(
        (_, args, context) => {
          console.log(context);
          return pubsub.asyncIterator(NEW_CHAT_MESSAGE);
        },
        (payload, args, context) => {
          return payload.chatId === args.chatId;
        }
      ),
    },
  },
};
