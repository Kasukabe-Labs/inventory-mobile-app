import { Router } from "express";
import {
  addProduct,
  deleteProduct,
  generateBarcodePreviewEndpoint,
  getAllProducts,
  getSingleProductByID,
  updateProduct,
  updateProductQuantity,
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

// ✅ Generate barcode preview (authenticated users)
ProductRouter.post(
  "/generate-barcode-preview",
  authenticate,
  generateBarcodePreviewEndpoint
);

// ✅ Only ADMIN can update products
ProductRouter.put(
  "/update",
  authenticate,
  upload.single("image"),
  isAdmin,
  updateProduct
);

ProductRouter.patch("/updateQty", authenticate, updateProductQuantity);

// ✅ Only ADMIN can delete products
ProductRouter.delete("/delete", authenticate, isAdmin, deleteProduct);

export default ProductRouter;
