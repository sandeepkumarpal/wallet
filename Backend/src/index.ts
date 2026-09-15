import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error: unknown) => {
      console.log("Err:", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`app is running on Port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log(`MongoDB connection failed !!! ${err}`));
