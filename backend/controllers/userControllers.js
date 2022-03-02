const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

const generateToken = require("../config/generateToken");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const registerUser = expressAsyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    pic,
  });

  if (user) {
    const { _id, name, email, pic } = user;
    res.status(201).json({
      _id,
      name,
      email,
      pic,
      token: generateToken({ id: user._id.toJSON(), email }),
    });
  } else {
    res.status(400);
    throw new Error("Something went wrong.");
  }
});

const authUser = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(401);
    throw new Error("User not found");
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    res.status(401);
    throw new Error("Invalid Credentials");
  }

  const { _id, name, pic, about } = user;
  res.status(201).json({
    _id,
    name,
    email,
    pic,
    about,
    token: generateToken({ id: user._id.toJSON(), email }),
  });
});

const allUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ _id: { $ne: req.user._id } })
    .select("-password");

  res.send(users);
});

const updateUserDetails = expressAsyncHandler(async (req, res) => {
  const { userId, newName, newAbout } = req.body;

  if (!userId || !newName) {
    res.status(400);
    throw new Error("Invalid input");
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: newName,
        about: newAbout,
      },
      { new: true }
    ).select("-password");
    res.send(user);
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = { registerUser, authUser, allUsers, updateUserDetails };
