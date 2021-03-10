const { model, Schema } = require("mongoose");
// TODO: Migrate to Postgres and add more strict validation
const userSchema = new Schema({
  // ID automatically added by mongodb so no need to add here
  email: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true,
  },
  businessEmail: {
    type: String,
    maxlength: 50,
    trim: true,
  },
  displayName: {
    type: String,
    maxlength: 50,
    default: "",
    trim: true,
  },
  firstName: {
    type: String,
    default: "",
    trim: true,
  },
  lastName: {
    type: String,
    default: "",
    trim: true,
  },
  username: {
    type: String,
    maxlength: 50,
    trim: true,
    lowercase: true,
  },
  password: String,
  createdAt: String,
  createdPosts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  mainPlatforms: [
    {
      type: String,
      default: "",
      trim: true,
    },
  ],
  genres: [
    {
      type: String,
      default: "",
      trim: true,
    },
  ],
  state: {
    type: String,
    default: "",
    trim: true,
  },
  age: {
    type: String,
    default: "",
    trim: true,
  },
  city: {
    type: String,
    default: "",
    trim: true,
  },
  gender: {
    type: String,
    default: "",
    trim: true,
  },
  siteUsageReason: {
    type: String,
    default: "",
  },
  inspiration: {
    type: String,
    default: "",
    trim: true,
  },
  favChildhoodSong: {
    type: String,
    default: "",
    trim: true,
  },
  currentFavSong: {
    type: String,
    default: "",
    trim: true,
  },
  isWorkPublic: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    default: "",
    trim: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  coverPhoto: {
    type: String,
    default: "",
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  collaboratorCount: {
    type: String,
    default: "0",
  },
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followingCount: {
    type: String,
    default: "0",
  },
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  followerCount: {
    type: String,
    default: "0",
  },
  pendingCollabs: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  chats: [
    {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  ],
  resetPassToken: {
    type: String,
    default: "",
  },
  refreshTokenVersion: {
    type: Number,
    default: 0,
  },
  cursor: {
    type: String,
    required: true,
    default: "",
  },
  tracks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Track",
    },
  ],
  albums: [
    {
      type: Schema.Types.ObjectId,
      ref: "Album",
    },
  ],
  paintings: [
    {
      type: Schema.Types.ObjectId,
      ref: "Painting",
    },
  ],
  videos: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
});

// userSchema.index({ username: "text", firstName: "text", lastName: "text", email: "text" });
module.exports = model("User", userSchema);
