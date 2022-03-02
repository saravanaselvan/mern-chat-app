const express = require("express");
const { clearNotification } = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.put("/clear", authMiddleware, clearNotification);

module.exports = router;
