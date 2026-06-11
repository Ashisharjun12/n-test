import { Router } from "express";
import { authMiddleware } from "../../shared/middlewares/auth.middleware.js";
import { UserRepository } from "./user.repository.js";
import { UserService } from "./user.service.js";
import { UserController } from "./user.controller.js";
import { CompanyRepository } from "../company/company.repository.js";

const router = Router();

const userRepo    = new UserRepository();
const companyRepo = new CompanyRepository();                    // ← inject for auto-company
const userService = new UserService(userRepo, companyRepo);    // ← pass both
const userController = new UserController(userService);

router.post("/", userController.create);                        // public — register
router.get("/", authMiddleware, userController.getAll);
router.get("/:id", authMiddleware, userController.getById);
router.patch("/:id", authMiddleware, userController.update);
router.patch("/:id/role", authMiddleware, userController.updateRole);
router.delete("/:id", authMiddleware, userController.delete);

export default router;
