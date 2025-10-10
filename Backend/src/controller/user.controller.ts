import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/commonFunctions";

const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password, profilePic } = req.body;
    console.log("fullName, email, password", fullName, email, password);
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
    // login logic

    const { email, password } = req.body;
    console.log("email, password", email, password);
    if (!email || !password) {
      throw new ApiError(400, "All fields are required");
    }
    const user = await User.findOne({ email });

    const isPasswordCorrect = await comparePassword(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      throw new ApiError(400, "Invalid password");
    }

    res.status(200).json({ message: "User Logged in successfully" });
  }
);

export { registerUser, loginUser };
