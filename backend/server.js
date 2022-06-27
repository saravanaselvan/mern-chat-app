const express = require("express");
const app = express();
const dotenv = require("dotenv");
const chats = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const { createServer } = require("http");
const server = createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/notification", notificationRoutes);

app.use(notFound);
app.use(errorHandler);

server.listen(PORT, console.log(`Server started on PORT ${PORT}`.yellow.bold));
io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    socket.join(userId);
  });
  socket.on("typing", ({ user, currentChatId }) => {
    socket.broadcast.emit("typing", { user, currentChatId });
  });
  socket.on("send message", ({ user, message, notification }) => {
    let chat = message.chat;
    chat.users.forEach((u) => {
      if (u._id === user._id) return;

      socket.in(u._id).emit("new message", { user, message, notification });
    });
  });
});
