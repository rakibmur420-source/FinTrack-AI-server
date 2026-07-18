import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const user = await User.create({ name, email, password, provider: "local" });
    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed.", error: (error as Error).message });
  }
};

// @route POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed.", error: (error as Error).message });
  }
};

// @route POST /api/auth/google
// Frontend sends the Google ID token received from Google Sign-In
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token." });
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email: payload.email,
        photoURL: payload.picture || "",
        provider: "google",
      });
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (error) {
    res.status(500).json({ message: "Google login failed.", error: (error as Error).message });
  }
};

// @route POST /api/auth/demo-login
// Auto-login with a seeded demo account (assignment requires a demo login button)
export const demoLogin = async (req: Request, res: Response) => {
  try {
    const demoEmail = "demo@fintrack.ai";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      user = await User.create({
        name: "Demo User",
        email: demoEmail,
        password: "demo12345",
        provider: "local",
      });
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, photoURL: user.photoURL },
    });
  } catch (error) {
    res.status(500).json({ message: "Demo login failed.", error: (error as Error).message });
  }
};
