const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const accessToken = authHeader.split(" ")[1];
    if (accessToken) {
      try {
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        return user;
      } catch (error) {
        throw new AuthenticationError("Invalid/Expired token. User not logged in.");
      }
    }
    throw new Error("Authentication token header invalid");
  }
  throw new Error("Authorization header must be provided");
};
