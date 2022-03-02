const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  fetchChats,
  accessChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
} = require("../controllers/chatControllers");
const router = express.Router();

router.post("/", authMiddleware, accessChat);
router.get("/", authMiddleware, fetchChats);
router.post("/group", authMiddleware, createGroupChat);
router.put("/:chatId/rename", authMiddleware, renameGroup);
router.put("/:chatId/groupremove", authMiddleware, removeFromGroup);
router.put("/:chatId/groupadd", authMiddleware, addToGroup);

module.exports = router;
