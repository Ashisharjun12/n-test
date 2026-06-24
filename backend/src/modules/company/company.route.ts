import { Router } from "express";
import { CompanyRepository } from "./company.repository.js";
import { CompanyService } from "./company.service.js";
import { CompanyController } from "./company.controller.js";

const router = Router();

const companyRepo = new CompanyRepository();
const companyService = new CompanyService(companyRepo);
const companyController = new CompanyController(companyService);

router.get("/", companyController.getAll);
router.get("/:id", companyController.getById);
router.post("/", companyController.createCompany);
router.patch("/:id", companyController.updateCompany);
router.post("/:id/signatures", companyController.addSignature);
router.patch("/:id/signatures/:signatureId/default", companyController.setDefaultSignature);
router.delete("/:id", companyController.deleteCompany);

export default router;