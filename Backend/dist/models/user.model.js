import mongoose, { Schema } from "mongoose";
// Create the schema
const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    profilePic: {
        type: String,
    },
}, { timestamps: true });
// Create and export the model
export const User = mongoose.model("User", userSchema);
