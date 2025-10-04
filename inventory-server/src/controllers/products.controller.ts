import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import {
  generateAndUploadBarcode,
  generateBarcodePreview,
  uploadImageToS3,
} from "../lib/uploadImage.js";

export async function getAllProducts(req: Request, res: Response) {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        price: true,
        imageUrl: true,
        barcodeUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error,
    });
  }
}

export async function addProduct(req: Request, res: Response) {
  try {
    const { name, sku, quantity, price, categoryId } = req.body;

    if (!name || !sku || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, sku, price, categoryId",
      });
    }

    let imageUrl: string | undefined;
    let barcodeUrl: string;

    // Upload product image to S3 (if provided)
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file, sku);
    }

    // Generate and upload barcode to S3
    barcodeUrl = await generateAndUploadBarcode(sku, price, quantity);

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        quantity: quantity ? parseInt(quantity) : 0,
        price: parseFloat(price),
        imageUrl: imageUrl ?? null,
        barcodeUrl,
        category: { connect: { id: categoryId } },
      },
    });

    return res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("Error creating product:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, message: "SKU must be unique" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Failed to create product" });
  }
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const {
      name,
      sku,
      quantity,
      price,
      categoryId,
      imageUrl: bodyImageUrl,
    } = req.body;

    // Get existing product to retrieve old SKU
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let imageUrl: string | undefined = bodyImageUrl;
    let barcodeUrl: string | undefined;

    // If SKU changed or new image uploaded, we need to update S3
    const skuChanged = sku && sku !== existingProduct.sku;
    const newSku = sku || existingProduct.sku;

    // Upload new product image if provided
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file, newSku);
    }

    // Regenerate barcode if SKU changed
    if (skuChanged) {
      barcodeUrl = await generateAndUploadBarcode(newSku, price, quantity);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku: newSku,
        quantity: quantity ? parseInt(quantity) : undefined,
        price: price ? parseFloat(price) : undefined,
        imageUrl,
        ...(barcodeUrl && { barcodeUrl }),
        ...(categoryId && { category: { connect: { id: categoryId } } }),
      },
    });

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update product" });
  }
}

export async function deleteProduct(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    await prisma.product.delete({
      where: { id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to delete product" });
  }
}

export async function getSingleProductByID(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        sku: true,
        quantity: true,
        price: true,
        imageUrl: true,
        barcodeUrl: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch product" });
  }
}

export async function generateBarcodePreviewEndpoint(
  req: Request,
  res: Response
) {
  try {
    const { sku, price, quantity } = req.body;

    if (!sku || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "SKU, price, and quantity are required",
      });
    }

    const barcodeDataUrl = await generateBarcodePreview(sku, price, quantity);

    return res.status(200).json({
      success: true,
      data: { barcodePreview: barcodeDataUrl },
    });
  } catch (error: any) {
    console.error("Error generating barcode preview:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate barcode preview",
    });
  }
}
