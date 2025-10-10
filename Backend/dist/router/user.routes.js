import { Router } from "express";
const router = Router();
router.route('/register-user').post(registerUser);
