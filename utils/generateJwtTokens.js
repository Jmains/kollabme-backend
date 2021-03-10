const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports.generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      refreshTokenVersion: user.refreshTokenVersion,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
};
