import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getSingleProductByID,
  updateProduct,
} from "../controllers/products.controller.js";
import { authenticate } from "../middlewares/verify.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../lib/multer.js";

const ProductRouter = Router();

// ✅ Anyone can view products
ProductRouter.get("/get-all", getAllProducts);

// ✅ Only ADMIN can add products
ProductRouter.post(
  "/add",
  authenticate,
  isAdmin,
  upload.single("image"),
  addProduct
);

ProductRouter.get("/get/:id", getSingleProductByID);
// ✅ Only ADMIN can update products
ProductRouter.put(
  "/update/:id",
  authenticate,
  upload.single("image"),
  updateProduct
);

// ✅ Only ADMIN can delete products
ProductRouter.delete("/delete/:id", authenticate, isAdmin, deleteProduct);

export default ProductRouter;
