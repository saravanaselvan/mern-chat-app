const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUserDetails,
} = require("../controllers/userControllers");
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", registerUser);
router.post("/login", authUser);
router.get("/", authMiddleware, allUsers);
router.put("/updateDetails", authMiddleware, updateUserDetails);

module.exports = router;
