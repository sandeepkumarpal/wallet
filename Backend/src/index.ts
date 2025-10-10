import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error: any) => {
      console.log("Err:", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`app is running on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(`MongoDB connection failed !!! ${err}`));
