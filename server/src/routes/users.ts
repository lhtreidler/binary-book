import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { userService } from "../services";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
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

router.get("/:friendId", async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const { friendId } = req.params;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    const data = await userService.getUserAndFollowDetails({
      userId: user.userId,
      friendId,
    });

    res.json(data);
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
