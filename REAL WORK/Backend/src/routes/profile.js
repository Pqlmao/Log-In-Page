const express = require("express");
const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/me", authenticate, getProfile);
router.put("/me", authenticate, updateProfile);

module.exports = router;
