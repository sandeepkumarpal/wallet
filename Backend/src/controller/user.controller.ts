import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/commonFunctions.js";
import jwt from "jsonwebtoken";

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
    });
    const userObject = newUser.toObject();
    const { password: _, ...userWithoutPassword } = userObject;
    res.status(201).json({
      message: "User registered successfully",
      user: userWithoutPassword,
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

    const isPasswordCorrect = await comparePassword(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect) {
      throw new ApiError(400, "Invalid email or password");
    }

    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "", {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "User Logged in successfully",
      user: {
        ...payload,
        monthlyBudget: user.monthlyBudget ?? 0,
        categoryBudgets: user.categoryBudgets ?? [],
      },
      token,
    });
  }
);

const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById(req.user?.id).select("-password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        profilePic: user.profilePic,
        monthlyBudget: user.monthlyBudget ?? 0,
        categoryBudgets: user.categoryBudgets ?? [],
      },
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

    const isPasswordCorrect = await comparePassword(
      currentPassword,
      user?.password || ""
    );

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid current password");
    }
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;

    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  }
);

export { registerUser, loginUser, changePassword, getCurrentUser };
