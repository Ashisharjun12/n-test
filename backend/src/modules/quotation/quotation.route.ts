import { Router } from "express";
import { QuotationRepository } from "./quotation.repository.js";
import { QuotationService } from "./quotation.service.js";
import { QuotationController } from "./quotation.controller.js";

const router = Router();

const quotationRepo = new QuotationRepository();
const quotationService = new QuotationService(quotationRepo);
const quotationController = new QuotationController(quotationService);

router.get("/", quotationController.getAll);
router.get("/:id/preview", quotationController.previewHtml);
router.get("/:id/pdf", quotationController.downloadPdf);
router.get("/:id", quotationController.getById);
router.post("/", quotationController.create);
router.patch("/:id", quotationController.update);
router.delete("/:id", quotationController.delete);

export default router;
