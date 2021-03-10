require("dotenv").config();

module.exports = (res, token) => {
  res.cookie("refreshToken", token, {
    maxAge: 604800000, // 7 Days
    httpOnly: process.env.NODE_ENV == "production",
    secure: process.env.NODE_ENV == "production",
    path: "/",
  });
};
