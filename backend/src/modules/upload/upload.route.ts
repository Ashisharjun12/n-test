import { Router } from "express";
import { UploadRepository } from "./upload.repository.js";
import { UploadService } from "./upload.service.js";
import { UploadController } from "./upload.controller.js";

const router = Router();

const uploadRepo = new UploadRepository();
const uploadService = new UploadService(uploadRepo);
const uploadController = new UploadController(uploadService);

router.post("/request-url", uploadController.requestUploadUrl);
router.post("/", uploadController.saveFileRecord);
router.get("/", uploadController.listFiles);
router.delete("/:id", uploadController.deleteFile);

export default router;