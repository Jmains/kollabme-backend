const NEW_NOTIFICATION = "NEW_NOTIFICATION";
const Notification = require("../../models/Notification");
const checkAuth = require("../../utils/check-auth");
const pubsub = require("../../utils/pubsub");
const paginatedResults = require("../../utils/paginateResults");

module.exports = {
  Query: {
    queryNotifications: async (_, { userId, searchQuery = null, first = 7, after }) => {
      try {
        let search = {};
        let allNotifs = null;

        // Search USER notifications
        if (searchQuery && userId) {
          search = {
            $or: [
              { message: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allNotifs = await Notification.find(search).populate("sender").populate("recipient");
          allNotifs = allNotifs.reverse();
          allNotifs = allNotifs.filter((notif) => userId === notif.recipient._id.toString());
          // Search ALL notifications
        } else if (searchQuery) {
          search = {
            $or: [
              { message: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
            ],
          };
          allNotifs = await Notification.find(search).populate("sender").populate("recipient");
          allNotifs = allNotifs.reverse();
          // Get USER notifications
        } else if (userId) {
          search = {
            $or: [{ recipient: userId }],
          };
          allNotifs = await Notification.find(search).populate("recipient").populate("sender");
          allNotifs = allNotifs.reverse();
        } else {
          allNotifs = await Notification.find({}).populate("recipient").populate("sender");
          allNotifs = allNotifs.reverse();
        }

        if (!allNotifs) throw new Error("No notifications found.");

        const notifs = paginatedResults({
          after,
          pageSize: first,
          results: allNotifs,
        });

        const edges = notifs.map((notif) => {
          return {
            node: notif,
            cursor: notif.cursor,
          };
        });

        const notifConnection = {
          edges: edges,
          pageInfo: {
            endCursor: notifs.length ? notifs[notifs.length - 1].cursor : null,
            hasNextPage: notifs.length
              ? notifs[notifs.length - 1].cursor !== allNotifs[allNotifs.length - 1].cursor
              : false,
          },
        };
        return notifConnection;
      } catch (err) {
        throw new Error("Failed to get notifications", err);
      }
    },
    getUserNotifications: async (_, { userId }) => {
      try {
        const notifications = await Notification.find({ recipient: userId })
          .populate("sender")
          .populate("recipient");
        if (!notifications) return [];
        return notifications.reverse();
      } catch (error) {
        throw new Error("Failed to retrieve notifications");
      }
    },
  },
  Mutation: {
    removeNotification: async (_, { notificationId }) => {
      try {
        const notification = await Notification.findById({ _id: notificationId });
        if (!notification) throw new Error("Notification not found.");
        await notification.deleteOne();
        return notification;
      } catch (error) {
        throw new Error("failed to remove notification: ", error);
      }
    },
  },
  Subscription: {
    newNotification: {
      subscribe: (_, args, { connection }) => {
        //checkAuth(connection.context);

        return pubsub.asyncIterator(NEW_NOTIFICATION);
      },
    },
  },
};
