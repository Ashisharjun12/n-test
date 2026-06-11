import { Router } from "express";
import { ProductRepository } from "./product.repository.js";
import { ProductService } from "./product.service.js";
import { ProductController } from "./product.controller.js";
import { ProductCategoryRepository } from "./productCategory.repository.js";
import { ProductCategoryService } from "./productCategory.service.js";
import { ProductCategoryController } from "./productCategory.controller.js";

const router = Router();

// ── product category routes 
const categoryRepo = new ProductCategoryRepository();
const categoryService = new ProductCategoryService(categoryRepo);
const categoryController = new ProductCategoryController(categoryService);

router.get("/category", categoryController.getAll);
router.get("/category/:id", categoryController.getById);
router.post("/category", categoryController.create);
router.patch("/category/:id", categoryController.update);
router.delete("/category/:id", categoryController.delete);

// ── product routes ──
const productRepo = new ProductRepository();
const productService = new ProductService(productRepo);
const productController = new ProductController(productService);

router.get("/", productController.getAll);
router.get("/settings", productController.getSettings);
router.put("/settings", productController.updateSettings);
router.get("/:id", productController.getById);
router.post("/", productController.create);
router.patch("/:id", productController.update);
router.delete("/:id", productController.delete);

export default router;