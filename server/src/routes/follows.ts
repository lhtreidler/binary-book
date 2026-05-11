import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth";
import { followService, userService } from "../services";

const router = Router();
router.use(authenticateToken);

router.post("/:friendId", async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const { friendId } = req.params;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    await followService.create({ toId: friendId, fromId: user?.userId });

    res.send();
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.delete("/:friendId", async (req: Request, res: Response) => {
  try {
    const { user } = req;
    const { friendId } = req.params;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    await followService.destroy({ toId: friendId, fromId: user?.userId });

    res.send();
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

export default router;
