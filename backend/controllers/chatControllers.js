const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");
const getOrCreateChat = require("../utils/getOrCreateChat");

const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("Userid missing");
    return res.sendStatus(400);
  }

  try {
    const chat = await getOrCreateChat(req.user._id, userId);
    res.send(chat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    let chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .populate({
        path: "notification",
        match: { userId: { $in: req.user._id } },
      })
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "_id name pic email about",
    });

    res.send(chats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createGroupChat = expressAsyncHandler(async (req, res) => {
  const { chatName, users } = req.body;
  if (!chatName || !users || users.length == 0) {
    res.status(400);
    throw new Error("Enter all the fields");
  }
  try {
    const chatData = {
      chatName: chatName,
      users: [req.user._id, ...JSON.parse(users)],
      isGroupChat: true,
      groupAdmin: req.user._id,
    };
    const createdChat = await Chat.create(chatData);
    const chat = await Chat.findById(createdChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    res.status(200).send(chat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const renameGroup = expressAsyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const { chatName } = req.body;

  if (!chatName) {
    res.status(400);
    throw new Error("New chat name is required");
  }

  if (!chatId) {
    res.status(400);
    throw new Error("Chat Id is missing");
  }
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        chatName,
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).send(updatedChat);
  } catch (error) {
    res.status(400);
    throw new Error("Update failed");
  }
});

const removeFromGroup = expressAsyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("User to remove is missing");
  }

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.send(chat);
  } catch (error) {
    res.status(400);
    throw new Error("Remove failed");
  }
});

const addToGroup = expressAsyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const { userId } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error("User to add is missing");
  }

  try {
    const chat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.send(chat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  fetchChats,
  accessChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};
