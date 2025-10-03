import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { uploadImageToS3 } from "../lib/uploadImage.js";

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
    const { name, sku, quantity, price, barcodeUrl, categoryId } = req.body;

    if (!name || !sku || !price || !barcodeUrl || !categoryId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: name, sku, price, barcodeUrl, categoryId",
      });
    }

    // handle image upload if provided
    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file);
    } else {
      imageUrl = req.body.imageUrl; // fallback to body if passed
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        quantity: parseInt(quantity) ?? 0,
        price,
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

    const { name, sku, quantity, price, barcodeUrl, categoryId } = req.body;

    // handle image upload if provided
    let imageUrl: string | undefined;
    if (req.file) {
      imageUrl = await uploadImageToS3(req.file);
    } else {
      imageUrl = req.body.imageUrl; // keep old or set new manually
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        sku,
        quantity: parseInt(quantity),
        price,
        imageUrl,
        barcodeUrl,
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
