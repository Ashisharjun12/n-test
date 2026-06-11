import { Router } from "express";
import { BankRepository } from "./bank.repository.js";
import { BankService } from "./bank.service.js";
import { BankController } from "./bank.controller.js";

const router = Router();

const bankRepo = new BankRepository();
const bankService = new BankService(bankRepo);
const bankController = new BankController(bankService);

router.get("/", bankController.getAll);
router.get("/:id", bankController.getById);
router.post("/", bankController.create);
router.patch("/:id", bankController.update);
router.patch("/:id/default", bankController.setDefault);
router.delete("/:id", bankController.delete);

export default router;
