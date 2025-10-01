import { Router } from "express";
import { ProductController } from "../controllers/products.controller.js";

const ProductRouter = Router();

ProductRouter.get("/get-all", async (req, res) => {
  ProductController(req, res);
});

export default ProductRouter;
