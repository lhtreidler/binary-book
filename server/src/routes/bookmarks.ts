import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.use(authenticateToken);

export default router;
