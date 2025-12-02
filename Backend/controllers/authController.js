// controllers/authController.js

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import nodemailer from "nodemailer";
import path from "path";
import multer from "multer";

// ======================= HELPERS =======================

// Generate JWT Token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Generate 6-digit OTP
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ======================= REGISTER USER =======================
export const registerUser = async (req, res) => {
  const { name, username, email, password, dob } = req.body;
  const normalizedEmail = email?.trim().toLowerCase();

  try {
    // Validation
    if (!name || !username || !email || !password || !dob)
      return res.status(400).json({ message: "All fields are required" });

    if (!/^[A-Za-z\s]+$/.test(name))
      return res
        .status(400)
        .json({ message: "Name must contain only letters and spaces" });

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      return res.status(400).json({
        message:
          "Username must be 3–20 characters and contain only letters, numbers, or underscores",
      });

    if (isNaN(new Date(dob).getTime()))
      return res.status(400).json({ message: "Invalid date of birth" });

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail)
        return res.status(400).json({ message: "Email already in use" });
      if (existingUser.username === username)
        return res.status(400).json({ message: "Username already taken" });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    // Create new user
    const user = await User.create({
      name,
      username,
      email: normalizedEmail,
      password,
      dob,
      otp,
      otpExpires,
    });

    // Send OTP Email
    await sendEmail(
      user.email,
      "Verify your Email - Echoes of Art",
      `<h3>Hi ${user.name},</h3>
       <p>Your OTP for email verification is:</p>
       <h2>${otp}</h2>
       <p>This OTP will expire in 10 minutes.</p>`
    );

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to activate your account.",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ======================= VERIFY EMAIL =======================
export const verifyEmail = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const { otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });
    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Send Welcome Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Echoes of Art" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Echoes of Art",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2 style="color: #6a1b9a;">Welcome to Echoes of Art, ${user.name}!</h2>
          <p>We’re thrilled to have you join our creative community where art meets imagination.</p>
          <br />
          <a href="${process.env.CLIENT_URL}/login" 
            style="background-color: #6a1b9a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Login to Your Account
          </a>
          <br /><br />
          <p style="font-size: 0.9em; color: #666;">— The Echoes of Art Team</p>
        </div>
      `,
    });

    return res.json({ message: "Email verified successfully! Welcome email sent." });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ======================= LOGIN USER =======================
export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  try {
    if (!identifier || !password)
      return res
        .status(400)
        .json({ message: "Email/Username and password are required" });

    const user = await User.findOne({
      $or: [
        { email: identifier.trim().toLowerCase() },
        { username: identifier },
      ],
    }).select("+password");

    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified)
      return res.status(403).json({
        message: "Email not verified. Please verify before logging in.",
      });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        dob: user.dob,
        profileImage: user.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ======================= RESEND OTP =======================
export const resendOTP = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      "Resend OTP - Echoes of Art",
      `<h3>Hi ${user.name},</h3>
       <p>Your new OTP is:</p>
       <h2>${otp}</h2>
       <p>Valid for 10 minutes.</p>`
    );

    return res.json({ message: "OTP resent to your email." });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ======================= GET PROFILE =======================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ message: "User not found" });

    const response = {
      ...user.toObject(),
      stats: {
        totalLikes: user.totalLikes || 0,
        categoryWise: user.postStats || { images: 0, videos: 0, audios: 0, others: 0 },
      },
    };

    res.json({ user: response });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ======================= UPDATE PROFILE =======================
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatableFields = [
      "name",
      "username",
      "firstName",
      "lastName",
      "dob",
      "about",
      "interests",
      "social1",
      "social2",
    ];

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    }

    // Check unique username
    if (req.body.username && req.body.username !== user.username) {
      const existing = await User.findOne({ username: req.body.username });
      if (existing)
        return res.status(400).json({ message: "Username already taken" });
    }

    await user.save();
    return res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ======================= MULTER CONFIG =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/profileImages/"),
  filename: (req, file, cb) =>
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});

export const upload = multer({ storage });

// ======================= UPDATE PROFILE IMAGE =======================
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = `/uploads/profileImages/${req.file.filename}`;
    await user.save();

    return res.json({ message: "Profile image updated successfully", user });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
