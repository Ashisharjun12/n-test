import { Router } from "express";
import { DispatchAddressRepository } from "./dispatchAddress.repository.js";
import { DispatchAddressService } from "./dispatchAddress.service.js";
import { DispatchAddressController } from "./dispatchAddress.controller.js";

const router = Router();
// Dispatch Address
const dispatchAddressRepo = new DispatchAddressRepository();
const dispatchAddressService = new DispatchAddressService(dispatchAddressRepo);
const dispatchAddressController = new DispatchAddressController(dispatchAddressService);


router.get("/", dispatchAddressController.getAll);
router.get("/:id", dispatchAddressController.getById);
router.post("/", dispatchAddressController.create);
router.patch("/:id", dispatchAddressController.update);
router.delete("/:id", dispatchAddressController.delete);    



export default router;