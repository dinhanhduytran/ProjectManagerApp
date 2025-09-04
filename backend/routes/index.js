import e from "express";
import authRoutes from "./auth.js";

const router = e.Router();

router.use("/auth", authRoutes);

export default router;
