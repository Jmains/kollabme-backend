const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");
const { validateRegisterInput, validateLoginInput } = require("../../utils/validators");
const sendEmail = require("../../utils/sendEmail");
const crypto = require("crypto");
const sendRefreshToken = require("../../utils/sendRefreshToken");
const { generateAccessToken, generateRefreshToken } = require("../../utils/generateJwtTokens");

function createForgotPasswordLink(url, token) {
  return `${url}/reset-password/${token}`;
}

async function clearResetToken(user) {
  try {
    user.resetPassToken = "";
    await user.save();
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = {
  Query: {
    async isResetPassTokenValid(_, { resetPassToken }) {
      try {
        const user = await User.findOne({ resetPassToken: resetPassToken });
        if (!user) {
          return false;
        }
        user.resetPassToken = "";
        await user.save();
        return true;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
  Mutation: {
    async login(_, { email, password }, { res }) {
      const { errors, valid } = validateLoginInput(email, password);
      if (!valid) {
        throw new UserInputError("Errors", { errors: errors });
      }
      const user = await User.findOne({ email });

      if (!user) {
        errors.general = "Invalid credentials";
        throw new UserInputError("User not found.", { errors: errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Invalid credentials";
        throw new UserInputError("Invalid credentials.", { errors: errors });
      }

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      sendRefreshToken(res, refreshToken);
      console.log(res);

      return {
        ...user._doc,
        id: user._id,
        accessToken,
      };
    },
    logout: async (_, __, { res }) => {
      sendRefreshToken(res, "");
      return true;
    },
    // REGISTER A NEW USER
    async register(_, { authInput: { username, email, password, confirmPassword } }, { res }) {
      const lowerCaseUsername = username.toLowerCase();
      const { valid, errors } = validateRegisterInput(
        lowerCaseUsername,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors: errors });
      }

      const user = await User.findOne({ username: lowerCaseUsername });
      if (user) {
        throw new UserInputError("username is taken.", {
          errors: {
            username: "This username is taken.",
          },
        });
      }

      const user2 = await User.findOne({ email: email });
      if (user2) {
        throw new UserInputError("email is taken.", {
          errors: {
            email: "This email is taken.",
          },
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      console.log(hashedPassword);
      const newUser = new User({
        email: email,
        username: username,
        password: hashedPassword,
        businessEmail: "",
        profilePic:
          "https://images.unsplash.com/photo-1518401543587-7bf7a1f74e66?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
        coverPhoto:
          "https://images.unsplash.com/photo-1551712720-8e6ffe24710a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
        createdAt: new Date().toISOString(),
        cursor: new Date().toISOString(),
      });
      const registeredUser = await newUser.save();
      const accessToken = generateAccessToken(registeredUser);
      const refreshToken = generateRefreshToken(registeredUser);

      sendRefreshToken(res, refreshToken);

      return {
        ...registeredUser._doc,
        id: registeredUser._id,
        accessToken,
      };
    },
    async sendForgotPassEmail(_, { recipient }) {
      // Side note: Maybe revoke all refresh tokens when user resets password
      try {
        const user = await User.findOne({ email: recipient });
        if (!user) throw new UserInputError("Send forgot email password");

        const token = crypto.randomBytes(32).toString("hex");
        user.resetPassToken = token;
        await user.save();
        // Clear reset token after 15 minutes
        setTimeout(clearResetToken, 1000 * 900, user);

        const url = "http://localhost:3000";
        const passResetLink = createForgotPasswordLink(url, token);

        await sendEmail(recipient, passResetLink);
        console.log(recipient);
        return { email: recipient };
      } catch (error) {
        console.log(error.message);
      }
    },
  },
};
