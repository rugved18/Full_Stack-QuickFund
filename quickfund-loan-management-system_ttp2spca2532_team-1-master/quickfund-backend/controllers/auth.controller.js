// backend/controller/auth.controller.js
import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import { hashPassword, comparePassword } from "../services/passwordService.js";
import { signToken } from "../services/jwtService.js";

/**
 * POST /api/users/register
 */

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role, details } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "User with that email already exists" });
  }

  const hashed = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    phone,
    password: hashed,
    role: role || "user",
    details: details || {}
  });


  res.status(201).json({
    message: "User registered successfully. Please login!"
  });
});

/**
 * POST /api/users/login
 */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = signToken({ id: user._id, role: user.role });

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

/**
 * GET /api/users/profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = req.user; // set by protect middleware
  res.json(user);
});

/**
 * PUT /api/users/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const { name, phone, details, password } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (details) user.details = { ...user.details, ...details };
  if (password) user.password = await hashPassword(password);

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    details: user.details,
  });
});
