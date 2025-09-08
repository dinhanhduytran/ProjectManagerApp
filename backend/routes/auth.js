import e from "express";
import {
  signUpSchema,
  signInSchema,
  veriryEmailSchema,
} from "../libs/validateSchema.ts";
import { validateData } from "../middlewares/validate.middleware.ts";
import {
  registerUser,
  loginUser,
  verifyEmail,
} from "../controllers/auth.controller.js";

const router = e.Router();

router.post("/register", validateData(signUpSchema), registerUser);
router.post("/login", validateData(signInSchema), loginUser);
router.post("./verify-email", validateData(veriryEmailSchema), verifyEmail);

export default router;
