import { Router } from "express";
import { authenticate } from "../middlewares/verify.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  addCategory,
  deleteCategory,
  editCategory,
  getAllCategories,
} from "../controllers/category.controller.js";

const CategoryRouter = Router();

CategoryRouter.get("/get-all", authenticate, isAdmin, getAllCategories);
CategoryRouter.post("/add", authenticate, isAdmin, addCategory);
CategoryRouter.put("/edit", authenticate, isAdmin, editCategory);
CategoryRouter.delete("/delete", authenticate, isAdmin, deleteCategory);

export { CategoryRouter };
