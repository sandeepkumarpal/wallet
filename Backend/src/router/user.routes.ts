import { Router } from "express";
import {
  changePassword,
  googleAuth,
  loginUser,
  registerUser,
  getCurrentUser,
} from "../controller/user.controller.js";
import { healthCheck } from "../controller/health.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = Router();

router.route("/health-check").get(healthCheck);
router.route("/register-user").post(registerUser);
router.route("/login-user").post(loginUser);
router.route("/google-auth").post(googleAuth);
router.route("/me").get(verifyToken, getCurrentUser);
router.route("/change-password").post(verifyToken, changePassword);

export default router;
