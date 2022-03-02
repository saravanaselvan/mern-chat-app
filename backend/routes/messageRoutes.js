const express = require("express");
const {
  fetchMessages,
  createMessage,
} = require("../controllers/messageControllers");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, fetchMessages);
router.post("/", authMiddleware, createMessage);

module.exports = router;
