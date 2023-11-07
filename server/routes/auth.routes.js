const router = require("express").Router();
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { isAuthenticated } = require("../middlewares/authMiddlewares");
const saltRounds = 12;
require("dotenv").config();

/**
 * ! All routes are prefixed by /api/auth
 */

router.post("/signup", async (req, res, next) => {
  try {
    // Get infos from req.body
    // username, password
    const { username, password, email } = req.body;
    // 1- Is the password safe?
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
      });
    }
    // 2- Check if the user exist
    // The email might already be used
    const foundUser = await User.findOne({ username: username });
    if (foundUser) {
      return res
        .status(400)
        .json({ message: `The username ${username} is already used.` });
    }

    const foundEmail = await User.findOne({ email: email });
    if (foundEmail) {
      return res
        .status(400)
        .json({ message: `The email ${email} is already used.` });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Save the user in the DB

    const createdUser = await User.create({
      username,
      password: hashedPassword,
      email,
    });
    res.status(201).json({
      message: `User ${createdUser.username} has been created with id ${createdUser._id}`,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email }).select("password email");
    if (!foundUser) {
      return res.status(400).json({ message: "Wrong credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      foundUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Wrong credentials" });
    }

    const payload = { _id: foundUser._id };
    const token = jwt.sign(payload, process.env.TOKEN_SECRET, {
      expiresIn: "2d",
    });
    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
});

/**
 * FOR THE FRONT
 */
router.get("/verify", isAuthenticated, async (req, res, next) => {
  try {
    const connectedUser = await User.findById(req.userId);
    res.json(connectedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
