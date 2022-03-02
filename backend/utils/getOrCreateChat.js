const Chat = require("../models/chatModel");
const User = require("../models/userModel");

module.exports = async (currentUserId, userId) => {
  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: currentUserId } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    return isChat[0];
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [currentUserId, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );

      return fullChat;
    } catch (error) {
      throw new Error(error.message);
    }
  }
};
