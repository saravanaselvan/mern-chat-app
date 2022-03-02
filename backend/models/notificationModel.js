const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    unreadCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
