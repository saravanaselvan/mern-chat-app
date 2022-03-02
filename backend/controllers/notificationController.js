const expressAsyncHandler = require("express-async-handler");
const Notification = require("../models/notificationModel");

const clearNotification = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    await Notification.findOneAndUpdate(
      { chat: chatId, userId },
      { unreadCount: 0 }
    );

    res.send("success");
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { clearNotification };
