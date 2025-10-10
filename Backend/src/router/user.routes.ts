import { Router } from "express";
import { loginUser, registerUser } from "../controller/user.controller";
import { healthCheck } from "../controller/health.controller";
import { asyncHandler } from "../utils/asyncHandler";
const router = Router();

router.route("/health-check").get(healthCheck);
router.route("/register-user").post(registerUser);
router.route("/login-user").post(loginUser);

export default router;
