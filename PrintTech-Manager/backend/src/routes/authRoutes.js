import express from "express";
import { login } from "../controllers/authController.js";

const router = express.Router();

// Rota para realizar login
router.post("/login", login);

export default router;