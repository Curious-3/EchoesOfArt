import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import nodemailer from "nodemailer";
import path from "path";
import multer from "multer";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER USER 
export const registerUser = async (req, res) => {
  const { name, email, password, dob } = req.body;

  if (!email || !password || !dob) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOTP();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    const user = await User.create({
      name,
      email,
      password,
      dob,
      otp,
      otpExpires,
    });

    await sendEmail(
      user.email,
      "Verify your Email - Echoes of Art",
      `<h3>Hi ${user.name || "User"},</h3>
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

//  VERIFY EMAIL 
export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Echoes of Art" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Echoes of Art",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
          <h2 style="color: #6a1b9a;">Welcome to Echoes of Art, ${user.name}!</h2>
          <p>We’re thrilled to have you join our creative community where art meets imagination.</p>
          <p>You can now log in and start exploring amazing artworks, connect with artists, and share your creations.</p>
          <br />
          <a href="${process.env.CLIENT_URL}/login" 
            style="background-color: #6a1b9a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Login to Your Account
          </a>
          <br /><br />
          <p style="font-size: 0.9em; color: #666;">— The Echoes of Art Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: "Email verified successfully! Welcome email sent." });
  } catch (error) {
    console.error("Verify email error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

//  LOGIN USER 
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify before logging in.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        dob: user.dob,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// RESEND OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(
      user.email,
      "Resend OTP - Echoes of Art",
      `<h3>Hi ${user.name || "User"},</h3>
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




//  Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

//  Update Profile (text fields) 
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update only text-based fields
    const fields = [
      "name",
      "firstName",
      "lastName",
      "dob",
      "about",
      "interests",
      "socialLinks"
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

//  Multer Config 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profileImages/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      req.user.id + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

export const upload = multer({ storage });

// - Update Profile Image 
export const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.profileImage = `/uploads/profileImages/${req.file.filename}`;
    await user.save();

    res.json({
      message: "Profile image updated successfully",
      user,
    });
  } catch (err) {
    console.error("Image upload error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};



