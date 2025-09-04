import e from "express";
import { signUpSchema, signInSchema } from "../libs/validateSchema.ts";
import { validateData } from "../middlewares/validate.middleware.ts";
import { registerUser, loginUser } from "../controllers/auth.controller.js";

const router = e.Router();

router.post("/register", validateData(signUpSchema), registerUser);
router.post("/login", validateData(signInSchema), loginUser);

export default router;
