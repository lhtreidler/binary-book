import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { userService } from "../services";
import { handlePaginatedRequest } from "../utils/pagination";

const router = Router();
router.use(authenticateToken);

router.get("/", async (req: Request, res: Response) => {
  try {
    const { q: username, page } = req.query;

    if (!username || typeof username !== "string") {
      res.status(403).send({ message: "Invalid request" });
      return;
    }

    const { result: users, nextPage } = await handlePaginatedRequest({
      page: page as string | undefined,
      callback: (params) =>
        userService.searchByUsername({ username, ...params }),
    });

    res.json({ users, nextPage });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/me", async (req: Request, res: Response) => {
  try {
    const { user } = req;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    const data = await userService.getUserAndFollowDetails({
      userId: user.userId,
    });

    if (!data) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    res.json(data);
  } catch (err) {
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

    if (!data) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    res.json(data);
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
