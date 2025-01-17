import { Router, Request, Response } from "express";

const router = Router();

router.get("/",  async (req: Request, res: Response) => {
    return res
      .status(200)
      .json({ "message": "API is running" });
});

export default router;
