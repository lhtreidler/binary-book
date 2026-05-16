import { Router, Request, Response } from "express";
import { authenticateToken } from "../../middleware/auth";
import { followService } from "../../services";
import { handlePaginatedRequest } from "../../utils/pagination";

const router = Router();
router.use(authenticateToken);

router.get("/recommended", async (req: Request, res: Response) => {
  try {
    const {
      user,
      query: { page },
    } = req;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    const result = await handlePaginatedRequest({
      page,
      callback: (params) =>
        followService.getRecommended({ userId: user.userId, ...params }),
    });

    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/following/:userId?", async (req: Request, res: Response) => {
  try {
    const {
      user,
      query: { page },
      params: { userId },
    } = req;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    const result = await handlePaginatedRequest({
      page: Number(page) || 1,
      callback: async (params) =>
        followService.getAllFollowing({
          from: userId || user.userId,
          viewerId: user.userId,
          ...params,
        }),
    });

    res.send(result);
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/followers/:userId?", async (req: Request, res: Response) => {
  try {
    const {
      user,
      query: { page },
      params: { userId },
    } = req;

    if (!user) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

    const result = await handlePaginatedRequest({
      page: Number(page) || 1,
      callback: async (params) =>
        followService.getAllFollowers({
          to: userId || user.userId,
          viewerId: user.userId,
          ...params,
        }),
    });

    res.send(result);
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

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
  } catch (err) {
    console.error(err);
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
