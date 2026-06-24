import { Router } from "express";
import { GstController } from "./gst.controller.js";

const router = Router();
const gstController = new GstController();

router.post("/verify", gstController.verify);

export default router;
