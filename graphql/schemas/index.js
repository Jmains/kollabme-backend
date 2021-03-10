const { gql } = require("apollo-server");

module.exports = gql`
  type User {
    id: ID!
    displayName: String
    businessEmail: String
    firstName: String # Change this to required later
    lastName: String # Change this to required later
    email: String!
    accessToken: String!
    username: String!
    createdAt: String!
    createdPosts: [Post]!
    # Profile Info Fields
    mainPlatforms: [String]!
    genres: [String]!
    age: String
    city: String
    state: String
    gender: String
    siteUsageReason: String
    inspiration: String
    favChildhoodSong: String
    currentFavSong: String
    isWorkPublic: Boolean
    bio: String
    profilePic: String
    coverPhoto: String
    # End Profile Info Fields
    collaborators: [User]!
    collaboratorCount: Int!
    followers: [User]!
    followerCount: Int!
    following: [User]!
    followingCount: Int!
    chats: [Chat]!
    refreshTokenCount: Int # Change this to required later
    resetPassToken: String!
    pendingCollabs: [User]!
    cursor: String!
  }
  type UserConnection {
    edges: [UserEdge]!
    pageInfo: PageInfo!
  }
  type UserEdge {
    node: User!
    cursor: String!
  }
  input UpdateUserProfileInput {
    businessEmail: String
    displayName: String
    firstName: String!
    lastName: String
    mainPlatforms: [String]!
    genres: [String]!
    age: String!
    city: String!
    state: String!
    gender: String!
    siteUsageReason: String
    inspiration: String
    favChildhoodSong: String
    currentFavSong: String
    isWorkPublic: Boolean
    bio: String
  }

  type Post {
    id: ID!
    body: String!
    createdAt: String!
    comments: [Comment]!
    likes: [Like]!
    likeCount: Int!
    commentCount: Int!
    author: User!
    username: String!
    imageUrl: String
    videoUrl: String
    audioUrl: String
    cursor: String
  }
  type PostConnection {
    edges: [PostEdge]!
    pageInfo: PageInfo!
  }
  type PostEdge {
    node: Post!
    cursor: String!
  }

  type Comment {
    id: ID!
    postId: ID!
    author: User!
    username: String!
    createdAt: String!
    body: String!
    likes: [User]!
    likeCount: Int!
    replies: [CommentReply]!
    replyCount: Int!
    cursor: String!
  }
  type CommentConnection {
    edges: [CommentEdge]!
    pageInfo: PageInfo!
  }
  type CommentEdge {
    node: Comment!
    cursor: String!
  }

  type CommentReply {
    id: ID!
    commentId: ID!
    author: User!
    username: String!
    body: String!
    likes: [User]!
    likeCount: Int!
    createdAt: String!
    cursor: String!
  }
  type CommentReplyConnection {
    edges: [CommentReplyEdge]!
    pageInfo: PageInfo!
  }
  type CommentReplyEdge {
    node: CommentReply!
    cursor: String!
  }

  type Like {
    id: ID!
    createdAt: String!
    author: User!
    username: String!
    post: Post
    comment: Comment
    commentReply: CommentReply
    track: Track
    painting: Painting
    album: Album
    video: Video
    cursor: String!
  }
  type LikeConnection {
    edges: [LikeEdge]!
    pageInfo: PageInfo!
  }
  type LikeEdge {
    node: Like!
    cursor: String!
  }

  type Notification {
    id: ID!
    createdAt: String!
    message: String!
    sender: User!
    recipient: User!
    postId: String!
    isRead: Boolean!
    type: String!
    cursor: String!
  }
  type NotificationConnection {
    edges: [NotificationEdge]!
    pageInfo: PageInfo!
  }
  type NotificationEdge {
    node: Notification!
    cursor: String!
  }

  type Chat {
    id: ID!
    owner: User!
    sendTo: User!
    messages: [Message]!
    createdAt: String!
  }

  type Message {
    chatId: ID!
    id: ID!
    createdAt: String!
    body: String!
    sentBy: User!
    recipient: User!
    imageUrl: String
    cursor: String!
  }
  type MessageConnection {
    edges: [MessageEdge]!
    pageInfo: PageInfo!
  }
  type MessageEdge {
    node: Message!
    cursor: String!
  }

  type S3Input {
    signedRequest: String!
    url: String!
  }

  type Track {
    id: ID!
    album: Album
    title: String!
    artistName: String!
    author: User!
    username: String!
    imageUrl: String
    audioUrl: String!
    isPublic: Boolean!
    createdAt: String!
    likes: [User!]!
    likeCount: Int!
    cursor: String!
  }
  type TrackConnection {
    edges: [TrackEdge!]!
    pageInfo: PageInfo!
  }
  type TrackEdge {
    node: Track!
    cursor: String!
  }
  input TrackInput {
    title: String!
    artistName: String!
    imageUrl: String
    audioUrl: String!
    isPublic: Boolean!
  }

  type Album {
    id: ID!
    title: String!
    author: User!
    username: String!
    coverImageUrl: String
    tracks: [Track!]!
    isPublic: Boolean!
    createdAt: String!
    likes: [User!]!
    likeCount: Int!
    cursor: String!
  }
  type AlbumConnection {
    edges: [AlbumEdge!]!
    pageInfo: PageInfo!
  }
  type AlbumEdge {
    node: Album!
    cursor: String!
  }
  input AlbumInput {
    title: String!
    coverImageUrl: String
    tracks: [TrackInput!]!
    isPublic: Boolean!
  }

  type Painting {
    id: ID!
    title: String!
    author: User!
    username: String!
    description: String!
    imageUrl: String!
    likes: [User]!
    likeCount: Int!
    isPublic: Boolean!
    createdAt: String!
    cursor: String!
  }
  type PaintingConnection {
    edges: [PaintingEdge]!
    pageInfo: PageInfo!
  }
  type PaintingEdge {
    node: Painting!
    cursor: String!
  }
  input PaintingInput {
    title: String!
    description: String
    imageUrl: String!
    isPublic: Boolean!
  }

  type Video {
    id: ID!
    title: String!
    description: String
    author: User!
    username: String!
    videoUrl: String!
    isPublic: Boolean!
    createdAt: String!
    likes: [Like]!
    likeCount: Int!
    cursor: String!
  }
  type VideoConnection {
    edges: [VideoEdge]!
    pageInfo: PageInfo!
  }
  type VideoEdge {
    node: Video!
    cursor: String!
  }
  input VideoInput {
    title: String!
    description: String
    videoUrl: String!
    isPublic: Boolean!
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
    url: String!
  }

  # Maybe Add First and Last Name Later
  input AuthInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
  }

  type Subscription {
    newNotification: Notification!
    newChatMessage(chatId: ID!): Message!
  }

  type Query {
    # Auth
    isResetPassTokenValid(resetPassToken: String!): Boolean!
    # Post
    queryPosts(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): PostConnection!
    getPost(postId: ID!): Post

    # User
    getUser(username: String): User
    getPaginatedUsers(searchQuery: String, first: Int, after: String): UserConnection!
    getProfilePic: String! # Just for when user updates their profile pic so we don't have to return the entire User object
    getCoverPhoto: String! # Just for when user updates their cover photo so we don't have to return the entire User object
    queryComments(
      postId: ID
      searchQuery: String
      first: Int
      after: String
    ): CommentConnection!
    queryCommentReplies(
      commentId: ID
      searchQuery: String
      first: Int
      after: String
    ): CommentReplyConnection!

    queryCollaborators(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): UserConnection!
    queryFollowers(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): UserConnection!
    queryFollowing(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): UserConnection!

    # Track
    queryTracks(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): TrackConnection!
    queryPublicTracks(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): TrackConnection!
    getTrack(trackId: ID!): Track!
    # Album
    queryAlbums(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): AlbumConnection!
    queryPublicAlbums(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): AlbumConnection!
    getAlbum(albumId: ID!): Album!
    # Painting
    queryPaintings(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): PaintingConnection!
    queryPublicPaintings(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): PaintingConnection!
    getPainting(paintingId: ID!): Painting!
    # Videos
    queryVideos(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): VideoConnection!
    queryPublicVideos(
      username: String
      searchQuery: String
      first: Int
      after: String
    ): VideoConnection!
    getVideo(videoId: ID!): Video!
    # Notification
    queryNotifications(
      userId: ID
      searchQuery: String
      first: Int
      after: String
    ): NotificationConnection!
    getUserNotifications(userId: ID): [Notification]
    # Likes
    queryPostLikes(postId: ID!, first: Int, after: String): LikeConnection!
    queryCommentLikes(commentId: ID!, first: Int, after: String): LikeConnection!
    queryCommentReplyLikes(commentReplyId: ID!, first: Int, after: String): LikeConnection!
    queryTrackLikes(trackId: ID!, first: Int, after: String): LikeConnection!
    queryPaintingLikes(paintingId: ID!, first: Int, after: String): LikeConnection!
    queryAlbumLikes(albumId: ID!, first: Int, after: String): LikeConnection!
    queryVideoLikes(videoId: ID!, first: Int, after: String): LikeConnection!
    # Chat
    getChatMessages(chatId: ID!): [Message]!
    getUserChats(userId: ID!): [Chat]!
    # Message
    getMessages(chatId: ID!): [Message]!
    queryMessages(
      chatId: ID
      searchQuery: String
      first: Int
      after: String
    ): MessageConnection!
  }

  type Mutation {
    # Auth
    register(authInput: AuthInput): User!
    logout: Boolean!
    login(email: String!, password: String!): User!
    sendForgotPassEmail(recipient: String!): String!
    # User
    updateUserProfile(userId: ID!, updateUserProfileInput: UpdateUserProfileInput): User!
    collabWithUser(userId: ID!, userToCollabWithId: ID!): User!
    followUser(userId: ID!, userToFollowId: ID!): User!
    updateProfilePic(userId: ID!, imageUrl: String!): User!
    updateCoverPhoto(userId: ID!, imageUrl: String!): User!
    uploadVideo(userId: ID!, videoUrl: String!): String! # Maybe use this later if user wants to post their best work
    # Collaboration
    acceptCollabRequest(userId: ID!, userToCollabWithId: ID!): User!
    declineCollabRequest(userId: ID!, userToCollabWithId: ID!): User!
    # Post
    createPost(
      userId: ID!
      body: String!
      imageUrl: String
      videoUrl: String
      audioUrl: String
    ): Post!
    deletePost(postId: ID!): String!
    likePost(postId: ID!): Post!
    # Track
    createTrack(trackInput: TrackInput!): Track!
    updateTrack(trackId: ID!, trackInput: TrackInput): Track!
    deleteTrack(trackId: ID!): String!
    likeTrack(trackId: ID!): Track!
    makeTrackPublic(trackId: ID!): Track!
    # Album
    createAlbum(albumInput: AlbumInput!): Album!
    updateAlbum(albumId: ID!, albumInput: AlbumInput!): Album!
    deleteAlbum(albumId: ID!): String!
    likeAlbum(albumId: ID!): Album!
    makeAlbumPublic(albumId: ID!): Album!
    # Painting
    createPainting(paintingInput: PaintingInput!): Painting!
    updatePainting(paintingId: ID!, paintingInput: PaintingInput!): Painting!
    deletePainting(paintingId: ID!): String!
    likePainting(paintingId: ID!): Painting!
    makePaintingPublic(paintingId: ID!): Painting!
    # Video
    createVideo(videoInput: VideoInput!): Video!
    updateVideo(videoId: ID!, videoInput: VideoInput!): Video!
    deleteVideo(videoId: ID!): String!
    likeVideo(videoId: ID!): Video!
    makeVideoPublic(videoId: ID!): Video!
    # Comment
    createComment(postId: ID!, body: String!): Comment!
    likeComment(commentId: ID!): Comment!
    deleteComment(postId: ID!, commentId: ID!): Post!
    # Comment Reply
    createCommentReply(commentId: ID!, body: String!): CommentReply!
    deleteCommentReply(commentId: ID!, commentReplyId: ID!): String!
    likeCommentReply(commentReplyId: ID!, commentId: ID!): CommentReply!
    # Notification
    removeNotification(notificationId: ID!): Notification!
    # Chat
    createNewChat(userId: ID!, userToChatWithId: ID!): Chat!
    # Message
    createMessage(chatId: ID!, userId: ID!, userToChatWithId: ID!, body: String!): Message!
    # AWS
    signS3(filename: String!, filetype: String!, filesize: Int!, uploadType: String!): S3Input!
  }
`;
