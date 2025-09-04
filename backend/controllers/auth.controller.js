import { property } from "zod";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.model.js";
import { sendEmail } from "../libs/sendEmail.ts";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Create new user
    const newUser = new User({ username, email, password });
    await newUser.save();

    // Generate JWT token
    const verificationToken = jwt.sign(
      { id: newUser._id, property: "email-verification" },
      process.env.JWT_SECRET,
      {
        expiresIn: "3h",
      }
    );

    const newVerification = new Verification({
      userId: newUser._id,
      token: verificationToken,
      expiredAt: Date.now() + 3 * 60 * 60 * 1000, // 3 hours from now
    });
    await newVerification.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<h1>Email Verification</h1>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verificationUrl}">Verify Email</a>
    <p>This link will expire in 3 hours.</p>
    `;
    const emailSubject = "Email Verification";
    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    // TODO: Send verification email
    res.status(201).json({
      message:
        "Verification email sent to your emial. Please check and verify your account.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const loginUser = async (req, res) => {
  try {
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { registerUser, loginUser };
