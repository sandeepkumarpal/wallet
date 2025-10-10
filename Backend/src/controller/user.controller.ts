import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../utils/commonFunctions";
import jwt from "jsonwebtoken";

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
      throw new ApiError(400, "Invalid email or password");
    }

    console.log("JWT_SECRET :>> ", process.env.JWT_SECRET_KEY);
    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      profilePic: user.profilePic,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY || "", {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({ message: "User Logged in successfully", user: payload, token });
  }
);

const verifyToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "");
    res.status(200).json({ message: "Token verified", user: decoded });
  }
);

const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    // const { currentPassword, newPassword } = req.body;
    // const user = await User.findOne({ email: req.user?.email });
    // const isPasswordCorrect = await comparePassword(
    //   currentPassword,
    //   user?.password || ""
    // );
    // if (!isPasswordCorrect) {
    //   throw new ApiError(400, "Invalid current password");
    // }
    // const hashedPassword = await hashPassword(newPassword);
    // user.password = hashedPassword;
    // if (!user) {
    //   throw new ApiError(400, "User not found");
    // }
    // await user.save();
    // res.status(200).json({ message: "Password changed successfully" });
  }
);

export { registerUser, loginUser, verifyToken, changePassword };
