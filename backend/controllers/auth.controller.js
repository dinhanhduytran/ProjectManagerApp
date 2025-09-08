import { property } from "zod";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.model.js";
import { sendEmail } from "../libs/sendEmail.ts";
import aj from "../libs/arcjet.ts";

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(email);
    const decision = await aj.protect(req, { requested: 1, email }); // Pass user email for context
    console.log(decision.isDenied());
    console.log("decision", decision);
    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid Email Address" }));
        console.log("hi");
      }
    } // Handle other denial reasons if needed

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

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) return res.status(401).json({ message: "Unauthorized" });

    const { id, property } = payload;
    if (property !== "email-verification")
      return res.status(400).json({ message: "Invalid Token" });
    // Find the verification record
    const verificationRecord = await Verification.findOne({
      userId: id,
      token,
    });
    if (!verificationRecord)
      return res.status(400).json({ message: "Invalid or Expired Token" });
    // Check if token is expired
    const isTokenExpired = verificatinRecord.expiredAt < Date.now();
    if (isTokenExpired)
      return res.status(400).json({ message: "Token has expired" });
    // Verify the user's email
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isVerified = true;
    await user.save();
    // Delete the verification record after successful verification (for cleanup)
    await Verification.findByIdAndDelete(verificationRecord._id);
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { registerUser, loginUser, verifyEmail };
