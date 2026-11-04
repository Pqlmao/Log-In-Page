const express = require("express");
const {
  getHome,
  getRankings,
  getGame,
  updateGameLibrary,
  submitGameReview,
} = require("../controllers/mediaController");
const {
  authenticate,
  authenticateOptional,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/home", authenticateOptional, getHome);
router.get("/rankings", authenticateOptional, getRankings);
router.get("/games/:slug", authenticateOptional, getGame);
router.put("/games/:slug/library", authenticate, updateGameLibrary);
router.post("/games/:slug/reviews", authenticate, submitGameReview);

module.exports = router;
