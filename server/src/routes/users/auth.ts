import { Router, Request, Response } from "express";
import {
  LoginInput,
  loginSchema,
  SignupInput,
  signupSchema,
  UpdateUserInput,
  updateUserSchema,
} from "../../utils/schemas.js";
import { validateBody } from "../../middleware/validation.js";
import { authService, userService } from "../../services";
import { formatEmail } from "../../utils/format.js";
import { authenticateToken } from "../../middleware/auth.js";

const router = Router();

// Signup route
router.post(
  "/signup",
  validateBody(signupSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email: unformattedEmail, password } = req.body as SignupInput;

      const email = formatEmail(unformattedEmail);

      // Check if user already exists
      const existingUser = await userService.getByEmail({ email });

      if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const token = await authService.createUserAndReturnToken({
        email,
        password,
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
router.get("/me", authenticateToken, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const user = await userService.getUserById({ id: req.user.userId });

  if (!user) {
    res.status(401).json({ message: "User not found" });
    return;
  }

  const { email, username, firstName, lastName, profileImg } = user;

  res.json({ email, username, firstName, lastName, profileImg });
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

router.post(
  "/details",
  authenticateToken,
  validateBody(updateUserSchema),
  async (req: Request, res: Response) => {
    try {
      const { user } = req;

      if (!user || !user.userId) {
        res.status(401).send({ message: "Unauthorized" });
        return;
      }

      const data = req.body as UpdateUserInput;

      await userService.update({ id: user.userId, data });
      res.send({ success: true });
    } catch {
      res.status(500).send({ message: "Internal Server Error" });
    }
  },
);

export default router;
