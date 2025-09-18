// backend/routes/user.router.js
import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// auth
router.post("/register", registerUser);
router.post("/login", loginUser);

// // profile (protected)
router.get("/users/profile", protect, getProfile);
router.put("/users/profile", protect, updateProfile);

export default router;
