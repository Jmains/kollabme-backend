const User = require("../../models/User");
const Notification = require("../../models/Notification");
const checkAuth = require("../../utils/check-auth");
const { UserInputError } = require("apollo-server");
const { validateProfileFormInput } = require("../../utils/validators");
const paginatedResults = require("../../utils/paginateResults");
const pubsub = require("../../utils/pubsub");

const NEW_NOTIFICATION = "NEW_NOTIFICATION";

const notificationTypes = {
  newFollow: "NEW_FOLLOW",
  newCollab: "NEW_COLLAB",
  newComment: "NEW_COMMENT",
  collabReqAccepted: "ACCEPT_COLLAB",
};

// Long function name I know chill
function removeUsersFromEachOthersCollabPendingList(userRequesting, userToCollabWith) {
  // Remove both from each others collab pending list
  userRequesting.pendingCollabs = userRequesting.pendingCollabs.filter(
    (pendingCol) => pendingCol._id.toString() !== userToCollabWith._id.toString()
  );
  userToCollabWith.pendingCollabs = userToCollabWith.pendingCollabs.filter(
    (pendingCol) => pendingCol._id.toString() !== userRequesting._id.toString()
  );
}

async function removeCollabNotificationDocument(userRequesting, userToCollabWith) {
  // Remove notification document
  const notification = Notification.findOne({
    sender: userRequesting._id.toString(),
    recipient: userToCollabWith._id.toString(),
  });
  if (!notification) console.log("New Collab notification already removed");
  if (notification) {
    try {
      await notification.deleteOne();
    } catch (error) {
      console.log("Failed to remove collab notification doc");
    }
  }
}

module.exports = {
  Query: {
    queryFollowing: async (_, { username, searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allFollowing = null;

        // Search USER tracks
        // if (searchQuery && username) {
        //   search = {
        //     $or: [
        //       { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
        //       { firstName: { $regex: searchQuery, $options: "i" } },
        //       { lastName: { $regex: searchQuery, $options: "i" } },
        //     ],
        //   };
        //   allFollowing = await User.find(search).populate("collaborators");
        //   console.log(allFollowing);

        //   allFollowing = allFollowing.filter((user) => user.collaborators.username === username);
        //   // Search ALL tracks
        // } else if (searchQuery) {
        //   search = {
        //     $or: [
        //       { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
        //       { title: { $regex: searchQuery, $options: "i" } },
        //     ],
        //   };
        //   allFollowing = await User.find(search).populate("collaborators");
        //   // Get USER tracks
        // }
        if (username) {
          search = {
            $or: [{ username: username }],
          };
          allFollowing = await User.findOne(search).populate("following");
          allFollowing = allFollowing.following;
        }

        if (!allFollowing) throw new Error("No following found.");

        const followings = paginatedResults({
          after,
          pageSize: first,
          results: allFollowing,
        });

        const edges = followings.map((following) => {
          return {
            node: following,
            cursor: following.cursor,
          };
        });

        const userConnection = {
          edges: edges,
          pageInfo: {
            endCursor: followings.length ? followings[followings.length - 1].cursor : null,
            hasNextPage: followings.length
              ? followings[followings.length - 1].cursor !==
                allFollowing[allFollowing.length - 1].cursor
              : false,
          },
        };
        return userConnection;
      } catch (err) {
        throw new Error("Failed to get tracks", err);
      }
    },
    queryFollowers: async (_, { username, searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allFollowers = null;

        // Search USER tracks
        // if (searchQuery && username) {
        //   search = {
        //     $or: [
        //       { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
        //       { firstName: { $regex: searchQuery, $options: "i" } },
        //       { lastName: { $regex: searchQuery, $options: "i" } },
        //     ],
        //   };
        //   allFollowers = await User.find(search).populate("collaborators");
        //   console.log(allFollowers);

        //   allFollowers = allFollowers.filter((user) => user.collaborators.username === username);
        //   // Search ALL tracks
        // } else if (searchQuery) {
        //   search = {
        //     $or: [
        //       { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
        //       { title: { $regex: searchQuery, $options: "i" } },
        //     ],
        //   };
        //   allFollowers = await User.find(search).populate("collaborators");
        //   // Get USER tracks
        // }
        if (username) {
          search = {
            $or: [{ username: username }],
          };
          allFollowers = await User.findOne(search).populate("followers");
          allFollowers = allFollowers.followers;
        }

        if (!allFollowers) throw new Error("No followers found.");

        const followers = paginatedResults({
          after,
          pageSize: first,
          results: allFollowers,
        });

        const edges = followers.map((follow) => {
          return {
            node: follow,
            cursor: follow.cursor,
          };
        });

        const userConnection = {
          edges: edges,
          pageInfo: {
            endCursor: followers.length ? followers[followers.length - 1].cursor : null,
            hasNextPage: followers.length
              ? followers[followers.length - 1].cursor !==
                allFollowers[allFollowers.length - 1].cursor
              : false,
          },
        };
        return userConnection;
      } catch (err) {
        throw new Error("Failed to get tracks", err);
      }
    },
    queryCollaborators: async (
      _,
      { username, searchQuery = null, first = 7, after },
      context
    ) => {
      try {
        let search = {};
        let allCollabs = null;

        // Search USER tracks
        // if (searchQuery && username) {
        //   search = {
        //     $or: [
        //       { username: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
        //       { firstName: { $regex: searchQuery, $options: "i" } },
        //       { lastName: { $regex: searchQuery, $options: "i" } },
        //     ],
        //   };
        //   allCollabs = await User.find(search).populate("collaborators");
        //   console.log(allCollabs);

        //   allCollabs = allCollabs.filter((user) => user.collaborators.username === username);
        //   // Search ALL tracks
        // } else if (searchQuery) {
        //   search = {
        //     $or: [
        //       { artistName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
        //       { title: { $regex: searchQuery, $options: "i" } },
        //     ],
        //   };
        //   allCollabs = await User.find(search).populate("collaborators");
        //   // Get USER tracks
        // }
        if (username) {
          search = {
            $or: [{ username: username }],
          };
          allCollabs = await User.findOne(search).populate("collaborators");
          allCollabs = allCollabs.collaborators;
        }

        if (!allCollabs) throw new Error("No collaborators found.");

        const collabs = paginatedResults({
          after,
          pageSize: first,
          results: allCollabs,
        });

        const edges = collabs.map((collab) => {
          return {
            node: collab,
            cursor: collab.cursor,
          };
        });

        const userConnection = {
          edges: edges,
          pageInfo: {
            endCursor: collabs.length ? collabs[collabs.length - 1].cursor : null,
            hasNextPage: collabs.length
              ? collabs[collabs.length - 1].cursor !== allCollabs[allCollabs.length - 1].cursor
              : false,
          },
        };
        return userConnection;
      } catch (err) {
        throw new Error("Failed to get tracks", err);
      }
    },

    // GET SINGLE USER
    async getUser(_, { username }) {
      if (username === null) {
        return null;
      }
      try {
        const user = await User.findOne({ username: username })
          .populate("createdPosts")
          .populate("followers")
          .populate("following")
          .populate("collaborators")
          .populate("chats")
          .populate("pendingCollabs");

        if (!user) throw new Error("User not found.");

        return user;
      } catch (error) {
        throw new Error(error);
      }
    },
    // GET ALL USERS
    getPaginatedUsers: async (parent, { searchQuery = null, first = 7, after }, context) => {
      try {
        let search = {};
        let allUsers = null;

        if (searchQuery) {
          search = {
            $or: [
              { displayName: { $regex: searchQuery, $options: "i" } },
              { firstName: { $regex: searchQuery, $options: "i" } }, // i means case insensitivity
              { lastName: { $regex: searchQuery, $options: "i" } },
              { email: { $regex: searchQuery, $options: "i" } },
              { username: { $regex: searchQuery, $options: "i" } },
            ],
          };
          allUsers = await User.find(search);
        }
        if (!allUsers) throw new Error("No users found.");

        const users = paginatedResults({
          after,
          pageSize: first,
          results: allUsers,
        });

        const edges = users.map((user) => {
          return {
            node: user,
            cursor: user.cursor,
          };
        });

        const userConnection = {
          edges: edges,
          pageInfo: {
            endCursor: users.length ? users[users.length - 1].cursor : null,
            hasNextPage: users.length
              ? users[users.length - 1].cursor !== allUsers[allUsers.length - 1].cursor
              : false,
          },
        };
        return userConnection;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async updateUserProfile(
      _,
      {
        userId,
        updateUserProfileInput: {
          businessEmail,
          displayName,
          firstName,
          lastName,
          mainPlatforms,
          genres,
          age,
          city,
          state,
          gender,
          bio,
          isWorkPublic,
          siteUsageReason,
          inspiration,
          favChildhoodSong,
          currentFavSong,
        },
      },
      context
    ) {
      // Check if user is logged in
      // TODO: Uncomment this after testing
      const user = checkAuth(context);
      const { valid, errors } = validateProfileFormInput(
        mainPlatforms,
        age,
        city,
        state,
        gender
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      try {
        const updatedUser = await User.findById({ _id: userId });
        if (!updatedUser) {
          throw new Error("User does not exist.");
        }
        // mainPlatform and genre are recieved as an array (max 3 for each)
        mainPlatforms.forEach((mainPlatform) => updatedUser.mainPlatforms.push(mainPlatform));
        genres.forEach((genre) => updatedUser.genres.push(genre));
        // Update user fields
        updatedUser.businessEmail = businessEmail;
        updatedUser.displayName = displayName;
        updatedUser.firstName = firstName;
        updatedUser.lastName = lastName;
        updatedUser.mainPlatforms = mainPlatforms;
        updatedUser.genres = genres;
        updatedUser.age = age;
        updatedUser.city = city;
        updatedUser.state = state;
        updatedUser.gender = gender;
        updatedUser.bio = bio;
        updatedUser.isWorkPublic = isWorkPublic;
        updatedUser.siteUsageReason = siteUsageReason;
        updatedUser.currentFavSong = currentFavSong;
        updatedUser.inspiration = inspiration;
        updatedUser.favChildhoodSong = favChildhoodSong;

        const user = await updatedUser.save();
        return user;
      } catch (error) {
        throw new Error(error);
      }
    },
    async updateProfilePic(_, { userId, imageUrl }, context) {
      // TODO: Uncomment after testing
      // Check if user is logged in
      checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found.");
        user.profilePic = imageUrl;
        const updatedUser = await user.save();
        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },
    async updateCoverPhoto(_, { userId, imageUrl }, context) {
      // TODO: Uncomment this after testing
      // Check if user is logged in
      checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found.");
        user.coverPhoto = imageUrl;
        const updatedUser = await user.save();
        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },
    async uploadVideo(_, { userId, videoUrl }, context) {
      // TODO: Uncomment this after testing
      // Check if user is logged in
      checkAuth(context);
      try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found.");
        user.videoUrls.push(videoUrl);
        await user.save();
        const imageOrVideoUrl = videoUrl;
        return { imageOrVideoUrl };
      } catch (error) {
        throw new Error("Video upload error" + error);
      }
    },
    async collabWithUser(_, { userId, userToCollabWithId }, context) {
      // Check if user if logged in
      // TODO: Uncomment when using frontend
      //checkAuth(context);
      try {
        const userRequesting = await User.findById(userId).populate("collaborators");
        const userToCollabWith = await User.findById(userToCollabWithId).populate(
          "collaborators"
        );
        if (!userToCollabWith)
          throw new Error("The user you request to collaborate with does not exist.");
        if (!userRequesting)
          throw new Error("Your collaboration request could not be performed");
        if (userRequesting) {
          // See if the current user is already collabing with the other user
          if (
            userRequesting.collaborators.find(
              (collaborators) => collaborators._id.toString() === userToCollabWithId
            )
          ) {
            removeCollabNotificationDocument(userRequesting, userToCollabWith);
            // User already collabed with, Uncollab both users
            userRequesting.collaborators = userRequesting.collaborators.filter(
              (collaborators) => collaborators._id.toString() !== userToCollabWithId
            );
            userToCollabWith.collaborators = userToCollabWith.collaborators.filter(
              (collaborators) => collaborators._id.toString() !== userId
            );

            await userRequesting.save();
            const updatedUser = await userToCollabWith.save();

            return updatedUser;
          } else {
            // Does pending collab alread exist if so remove it from both users
            removeUsersFromEachOthersCollabPendingList(userRequesting, userToCollabWith);
            // Not collabing send collab notification
            // Add both users to their respective pendingCollab list
            userRequesting.pendingCollabs.push(userToCollabWith);
            userToCollabWith.pendingCollabs.push(userRequesting);
            removeCollabNotificationDocument(userRequesting, userToCollabWith);
            // Sorted by newest notifications first
            const userNotifications = await Notification.find({
              recipient: userToCollabWith._id,
              type: notificationTypes.newCollab,
            }).sort({ createdAt: -1 });
            // Max of 50 Collab notifications in db
            if (userNotifications && userNotifications.length > 200) {
              // If queue is full remove oldest notification
              const oldestNotif = userNotifications.pop();
              // If the oldest notification involves the user and his
              //collabs and each are in each others collaborator pending list
              if (
                userRequesting.pendingCollabs.find(
                  (pendingCol) =>
                    pendingCol._id.toString() === oldestNotif.recipient._id.toString()
                ) &&
                userToCollabWith.pendingCollabs.find(
                  (pendingCol) =>
                    pendingCol._id.toString() === oldestNotif.sender._id.toString()
                )
              ) {
                // Remove both from each others collab pending list by checking if notif expired
                userRequesting.pendingCollabs = userRequesting.pendingCollabs.filter(
                  (pendingCol) =>
                    pendingCol._id.toString() !== oldestNotif.recipient._id.toString()
                );
                userToCollabWith.pendingCollabs = userToCollabWith.pendingCollabs.filter(
                  (pendingCol) =>
                    pendingCol._id.toString() !== oldestNotif.sender._id.toString()
                );
              }
              await oldestNotif.deleteOne();
            }
            await userRequesting.save();
            const updatedUser = await userToCollabWith.save();
            // Create Collab notification
            // Create notification in db
            const notification = new Notification({
              createdAt: new Date().toISOString(),
              message: `${userRequesting.username} has requested to collaborate with you.`,
              sender: userRequesting,
              recipient: updatedUser,
              type: notificationTypes.newCollab,
              postId: "",
              isRead: false,
              cursor: new Date().toISOString(),
            });

            pubsub.publish(NEW_NOTIFICATION, {
              newNotification: notification,
            });

            await notification.save();
            return updatedUser;
          }
        }
        await userRequesting.save();
        const updatedUser = await userToCollabWith.save();
        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },
    acceptCollabRequest: async (_, { userId, userToCollabWithId }, context) => {
      // Check if user if logged in
      // TODO: Uncomment when using frontend
      //checkAuth(context);
      try {
        const userRequesting = await User.findById(userId).populate("collaborators");
        const userToCollabWith = await User.findById(userToCollabWithId).populate(
          "collaborators"
        );
        if (!userToCollabWith)
          throw new Error("The user you request to collaborate with does not exist.");
        if (!userRequesting)
          throw new Error("Your collaboration request could not be performed");

        removeUsersFromEachOthersCollabPendingList(userRequesting, userToCollabWith);
        removeCollabNotificationDocument(userRequesting, userToCollabWith);
        // Collab both users
        userRequesting.collaborators.push(userToCollabWith);
        userToCollabWith.collaborators.push(userRequesting);

        // TODO: Auto Remove notif doc after a week
        const notification = new Notification({
          createdAt: new Date().toISOString(),
          message: `${userToCollabWith.username} accepted your collaboration request.`,
          sender: userToCollabWith,
          recipient: userRequesting,
          type: notificationTypes.collabReqAccepted,
          postId: "",
          isRead: false,
          cursor: new Date().toISOString(),
        });

        pubsub.publish(NEW_NOTIFICATION, {
          newNotification: notification,
        });

        await notification.save();
        await userRequesting.save();
        const updatedUser = await userToCollabWith.save();
        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },
    declineCollabRequest: async (_, { userId, userToCollabWithId }, context) => {
      //checkAuth(context);
      try {
        const userRequesting = await User.findById(userId).populate("collaborators");
        const userToCollabWith = await User.findById(userToCollabWithId).populate(
          "collaborators"
        );
        if (!userToCollabWith)
          throw new Error("The user you request to DECLINE collaborate with does not exist.");
        if (!userRequesting)
          throw new Error("Your collaboration DECLINE request could not be performed");

        removeUsersFromEachOthersCollabPendingList(userRequesting, userToCollabWith);
        removeCollabNotificationDocument(userRequesting, userToCollabWith);

        await userRequesting.save();
        const updatedUser = await userToCollabWith.save();
        return updatedUser;
      } catch (error) {
        throw new Error(error);
      }
    },

    async followUser(_, { userId, userToFollowId }, context) {
      // Check if user if logged in
      // TODO: Uncomment when using frontend
      //checkAuth(context);
      try {
        const userRequesting = await User.findById(userId)
          .populate("followers")
          .populate("following");
        const userToFollow = await User.findById(userToFollowId)
          .populate("followers")
          .populate("following");
        if (!userToFollow) throw new Error("The user you request to follow does not exist.");
        if (userRequesting) {
          // See if the current user is already following the other user
          if (
            userRequesting.following.find(
              (following) => following._id.toString() === userToFollowId
            )
          ) {
            // Already followed, unfollow
            userRequesting.following = userRequesting.following.filter(
              (following) => following._id.toString() !== userToFollowId
            );
            // Remove current user from the other users' followers
            userToFollow.followers = userToFollow.followers.filter(
              (following) => following._id.toString() !== userId
            );
            userRequesting.save();
            const updatedUserToFollow = await userToFollow.save();
            // Remove notification document
            const notification = await Notification.findOne({
              sender: userId,
              recipient: userToFollowId,
              type: notificationTypes.newFollow,
            });
            if (!notification) console.log("New Follow notification already removed");
            if (notification) {
              notification.deleteOne();
            }
            return updatedUserToFollow;
          } else {
            // not followed, follow
            userRequesting.following.push(userToFollow);
            userToFollow.followers.push(userRequesting);
            userRequesting.save();
            const updatedUserToFollow = await userToFollow.save();
            // Sorted by newest notifications first
            const userNotifications = await Notification.find({
              recipient: userToFollowId,
              type: notificationTypes.newFollow,
            }).sort({ createdAt: -1 });

            // Max of 50 Follow notifications in db
            if (userNotifications && userNotifications.length > 49) {
              // If queue is full remove oldest notification
              const oldestNotif = userNotifications.pop();
              oldestNotif.deleteOne();
            }
            // Create notification in db
            const notification = new Notification({
              createdAt: new Date().toISOString(),
              message: `${userRequesting.username} has started following you.`,
              sender: userRequesting,
              recipient: userToFollow,
              postId: "",
              type: notificationTypes.newFollow,
              isRead: false,
              cursor: new Date().toISOString(),
            });
            const fullNotification = notification.populate("sender").populate("recipient");

            pubsub.publish(NEW_NOTIFICATION, {
              newNotification: {
                ...fullNotification._doc,
                id: fullNotification._id,
              },
            });

            notification.save();
            return updatedUserToFollow;
          }
        }
        userRequesting.save();
        const updatedUserToFollow = await userToFollow.save();
        return updatedUserToFollow;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
