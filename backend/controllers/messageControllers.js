const expressAsyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const getOrCreateChat = require("../utils/getOrCreateChat");

const fetchMessages = expressAsyncHandler(async (req, res) => {
  const { chatId } = req.query;

  if (!chatId) {
    res.status(400);
    throw new Error("Chat Id is missing");
  }

  try {
    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: -1 })
      .populate("sender", "-password");

    await Notification.findOneAndUpdate(
      { chat: chatId, userId: req.user._id },
      { unreadCount: 0 }
    );
    res.send(messages);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

const createMessage = expressAsyncHandler(async (req, res) => {
  const { userId, content } = req.body;
  let { chatId } = req.body;

  if (!chatId && !userId) {
    res.status(400);
    throw new Error("Chat Id is missing");
  }

  if (!chatId && userId) {
    const chat = await getOrCreateChat(req.user._id, userId);
    chatId = chat._id;
  }
  try {
    let message = await Message.create({
      sender: req.user,
      content,
      chat: chatId,
    });
    message = await message.populate("sender", "_id name pic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "_id name pic email",
    });

    let userId = message.chat.users.find(
      (user) => user._id.toJSON() !== req.user._id.toJSON()
    )._id;

    let notification = await Notification.findOne({ chat: chatId, userId });
    if (!notification) {
      notification = await Notification.create({
        chat: chatId,
        userId,
        unreadCount: 1,
      });
    } else {
      await Notification.updateOne(
        { chat: chatId, userId },
        { unreadCount: notification.unreadCount + 1 },
        { new: true }
      );
      notification = await Notification.findOne({ chat: chatId, userId });
    }

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
      notification,
    });
    res.send({ message, notification });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { fetchMessages, createMessage };
