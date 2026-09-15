import { OAuth2Client } from "google-auth-library";
import { User, type IUser, type AuthProvider } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/commonFunctions.js";
import jwt from "jsonwebtoken";

const getGoogleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const publicUser = (user: IUser) => ({
  id: user._id,
  email: user.email,
  fullName: user.fullName,
  profilePic: user.profilePic,
  monthlyBudget: user.monthlyBudget ?? 0,
  categoryBudgets: user.categoryBudgets ?? [],
  authProvider: user.authProvider ?? "local",
  hasPassword: Boolean(user.password),
});

const signToken = (user: IUser) => {
  const payload = {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    profilePic: user.profilePic,
  };
  return jwt.sign(payload, process.env.JWT_SECRET_KEY || "", {
    expiresIn: "7d",
  });
};

const resolveProvider = (user: IUser): AuthProvider => {
  const hasPassword = Boolean(user.password);
  const hasGoogle = Boolean(user.googleId);
  if (hasPassword && hasGoogle) return "both";
  if (hasGoogle) return "google";
  return "local";
};

const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password, profilePic } = req.body;
    if (!fullName || !email || !password) {
      throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({ email });
    if (user) {
      throw new ApiError(400, "User already exists");
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      profilePic,
      monthlyBudget: 0,
      authProvider: "local",
    });
    const userObject = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    res.status(201).json({
      message: "User registered successfully",
      user: {
        ...userWithoutPassword,
        id: newUser._id,
        hasPassword: true,
        authProvider: "local",
      },
    });
  }
);

const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(400, "Invalid email or password");
    }

    if (!user.password) {
      throw new ApiError(400, "This account uses Google Sign-In");
    }

    const isPasswordCorrect = await comparePassword(password, user.password);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid email or password");
    }

    const token = signToken(user);

    res.status(200).json({
      message: "User Logged in successfully",
      user: publicUser(user),
      token,
    });
  }
);

const googleAuth = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body as { credential?: string };
    if (!credential) {
      throw new ApiError(400, "Google credential is required");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new ApiError(503, "Google Sign-In is not configured");
    }

    let ticket;
    try {
      ticket = await getGoogleClient().verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
    } catch {
      throw new ApiError(401, "Invalid Google credential");
    }

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new ApiError(401, "Invalid Google credential");
    }
    if (payload.email_verified === false) {
      throw new ApiError(400, "Google email is not verified");
    }

    const email = payload.email.toLowerCase().trim();
    const googleId = payload.sub;
    const fullName =
      payload.name?.trim() || email.split("@")[0] || "Wallet user";
    const profilePic = payload.picture;

    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      let dirty = false;
      if (!user.googleId) {
        user.googleId = googleId;
        dirty = true;
      }
      if (profilePic && !user.profilePic) {
        user.profilePic = profilePic;
        dirty = true;
      }
      const nextProvider = resolveProvider(user);
      if (user.authProvider !== nextProvider) {
        user.authProvider = nextProvider;
        dirty = true;
      }
      if (dirty) await user.save();
    } else {
      user = await User.create({
        fullName,
        email,
        googleId,
        profilePic,
        monthlyBudget: 0,
        authProvider: "google",
      });
    }

    const token = signToken(user);

    res.status(200).json({
      message: "Signed in with Google",
      user: publicUser(user),
      token,
    });
  }
);

const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      user: publicUser(user),
    });
  }
);

const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findOne({ email: req.user?.email });
    if (currentPassword === newPassword) {
      throw new ApiError(
        400,
        "current password and new password can not be same"
      );
    }
    if (!user) {
      throw new ApiError(400, "User not found");
    }

    if (!user.password) {
      throw new ApiError(
        400,
        "This account uses Google Sign-In and has no password"
      );
    }

    const isPasswordCorrect = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid current password");
    }
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.authProvider = resolveProvider(user);

    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  }
);

export {
  registerUser,
  loginUser,
  googleAuth,
  changePassword,
  getCurrentUser,
};
