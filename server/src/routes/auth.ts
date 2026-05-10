import { Router, Request, Response } from "express";
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
} from "../utils/schemas.js";
import { validateBody } from "../middleware/validation.js";
import { userService } from "../services/userService.js";
import { authService } from "../services/authService.js";
import { formatEmail, formatUsername } from "../utils/format.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Signup route
router.post(
  "/signup",
  validateBody(signupSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        email: unformattedEmail,
        username: unformattedUsername,
        password,
      } = req.body as SignupInput;

      const email = formatEmail(unformattedEmail);
      const username = formatUsername(unformattedUsername);

      // Check if user already exists
      const existingUser = await userService.getByEmail({ email });

      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const token = await authService.createUserAndReturnToken({
        email,
        password,
        username,
      });

      res.status(201).json({
        token,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Login route
router.post(
  "/login",
  validateBody(loginSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email: unformattedEmail, password } = req.body as LoginInput;

      const email = formatEmail(unformattedEmail);

      // Find user
      const user = await userService.getByEmail({ email });

      if (!user) {
        res.status(401).json({
          message:
            "Invalid email or password. Please check your credentials and try again.",
        });
        return;
      }

      // Verify password
      const isPasswordValid = await authService.getIsValidPassword(
        password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        res.status(401).json({
          message:
            "Invalid email or password. Please check your credentials and try again.",
        });
        return;
      }

      // Generate token
      const token = authService.createToken({
        userId: user.id,
        email: user.email,
      });

      res.json({
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res
        .status(500)
        .json({ message: "Login failed. Please try again later." });
    }
  },
);

// Get current user
router.get("/me", (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  res.json({ user: req.user });
});

router.get(
  "/check-username",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { username } = req.query;

      if (!username || typeof username !== "string") {
        res.status(400).send({ message: "Invalid request" });
        return;
      }

      const isTaken = await userService.getIsUsernameTaken({ username });

      res.json({ isTaken });
    } catch {
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

export default router;
