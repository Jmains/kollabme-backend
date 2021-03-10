const { ApolloServer } = require("apollo-server-express");
// GraphQL
const typeDefs = require("./graphql/schemas");
const resolvers = require("./graphql/resolvers/index");
// Necessary packages
const mongoose = require("mongoose"); // TODO: Migrate to Postgres after mvp
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const checkAuth = require("./utils/check-auth");
const path = require("path");
require("dotenv").config();
// Utils
const sendRefreshToken = require("./utils/sendRefreshToken");
const { generateAccessToken, generateRefreshToken } = require("./utils/generateJwtTokens");

const app = express();
const port = process.env.PORT || 8000;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res, connection }) => ({ req, res, connection }),
  // subscriptions: {
  //   onConnect: (connectionParams, webSocket, context) => {
  //     return connectionParams.authToken;
  //   },
  // },
  // engine: {
  //   // For Apollo Studio
  //   reportSchema: true,
  //   graphVariant: "current",
  // },
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.disable("x-powered-by");
app.use(
  cors({
    credentials: true, // For cookies
  })
);

app.use(cookieParser());

// TODO: Move this logic to different file
// Handling refresh tokens
app.post("/api/refreshToken", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      ok: false,
      accessToken: "",
      message: "refreshToken not provided",
    });
  }
  let payload = null;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return res.status(401).json({
      ok: false,
      accessToken: "",
      message: "unauthorized refreshToken",
    });
  }
  const user = await User.findById({ _id: payload.id });
  if (!user) {
    return res.status(500).json({
      ok: false,
      accessToken: "",
      message: "User not found.",
    });
  }
  if (user.refreshTokenVersion !== payload.refreshTokenVersion) {
    return res.status(401).json({
      ok: false,
      accessToken: "",
      message: "unauthorized refreshToken",
    });
  }

  const accessToken = generateAccessToken(user);
  sendRefreshToken(res, generateRefreshToken(user));
  return res.send({
    ok: true,
    accessToken: accessToken,
    message: "congrats here is your new access token",
  });
});

server.applyMiddleware({ app, cors: false });
const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

mongoose.set("useCreateIndex", true);
mongoose
  .connect(process.env.CONNECTIONSTRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongodb");
    httpServer.listen(port, () => {
      console.log(`server running on port: http://localhost:${port}${server.graphqlPath}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
