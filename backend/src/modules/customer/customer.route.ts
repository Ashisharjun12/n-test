import { Router } from "express";
import { CustomerRepository } from "./customer.repository.js";
import { CustomerService } from "./customer.service.js";
import { CustomerController } from "./customer.controller.js";

const router = Router();

const customerRepo = new CustomerRepository();
const customerService = new CustomerService(customerRepo);
const customerController = new CustomerController(customerService);

router.get("/", customerController.getAll);
router.get("/:id", customerController.getById);
router.post("/", customerController.create);
router.patch("/:id", customerController.update);
router.delete("/:id", customerController.delete);

export default router;