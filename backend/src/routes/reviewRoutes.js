import express from "express";
import { createReview, getHistory } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js"; // Import the guard

const router = express.Router();

// Apply the 'protect' middleware so only logged-in users can reach these
router.post("/", protect, createReview);
router.get("/history", protect, getHistory);

export default router;