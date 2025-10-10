import { asyncHandler } from "../utils/asyncHandler.js";
const registerUser = asyncHandler(async (req, res) => {
    // Your registration logic here
    res.status(201).json({ message: "User registered successfully" });
});
const loginUser = asyncHandler(async (req, res) => {
    // Your registration logic here
    res.status(200).json({ message: "User Logged in successfully" });
});
export { registerUser, loginUser };
