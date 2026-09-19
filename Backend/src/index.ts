import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
  .then(() => {
    app.on("error", (error: unknown) => {
      console.log("Err:", error);
    });
    const port = Number(process.env.PORT) || 8000;
    app.listen(port, "0.0.0.0", () => {
      console.log(`app is running on Port ${port}`);
    });
  })
  .catch((err) => console.log(`MongoDB connection failed !!! ${err}`));
