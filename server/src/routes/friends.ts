import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { userService } from "../services";

const router = Router();
router.use(authenticateToken);

router.get("/search", async (req: Request, res: Response) => {
  try {
    const { q: username } = req.query;

    if (!username || typeof username !== "string") {
      res.status(403).send({ message: "Invalid request" });
      return;
    }

    const users = await userService.searchByUsername({
      username,
    });

    res.json({ users });
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
