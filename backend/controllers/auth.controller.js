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

    // Generate JWT token for email verification
    const verificationToken = jwt.sign(
      { id: newUser._id, purpose: "email-verification" },
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
    // Send verification email
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
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Check if email is verified
    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });
      if (existingVerification && existingVerification.expiredAt > Date.now()) {
        // verification record exists and not expired
        return res.status(400).json({
          message:
            "Email is not verified. Please check your email for the verification link.",
        });
      } else {
        // Delete any existing verification records (expired or not)
        await Verification.findByIdAndDelete(existingVerification?._id);
        // Create a new verification record
        const verificationToken = jwt.sign(
          { id: user._id, purpose: "email-verification" },
          process.env.JWT_SECRET,
          {
            expiresIn: "3h",
          }
        );
        const newVerification = new Verification({
          userId: user._id,
          token: verificationToken,
          expiredAt: Date.now() + 3 * 60 * 60 * 1000, // 3 hours from now
        });
        await newVerification.save();
        // Send verification email
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
        res.status(200).json({
          // use 200 because user exists but not verified
          message:
            "Verification email sent to your emial. Please check and verify your account.",
        });
      }
    }

    // Check if password matches, pasword is checked in user model
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, purpose: "access" }, // add purpose to differentiate token types
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();
    // Exclude password from user object
    const userData = user.toObject();
    delete userData.password;
    // Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
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

    const { id, purpose } = payload;
    if (purpose !== "email-verification")
      return res.status(400).json({ message: "Invalid Token" });
    // Find the verification record
    const verificationRecord = await Verification.findOne({
      userId: id,
      token,
    });
    if (!verificationRecord)
      return res.status(400).json({ message: "Invalid or Expired Token" });
    // Check if token is expired
    const isTokenExpired = verificationRecord.expiredAt < Date.now(); // expired at 4 o'clock < now 5 o'clock -> true
    if (isTokenExpired)
      return res.status(400).json({ message: "Token has expired" });
    // Verify the user's email
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isEmailVerified = true;
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
