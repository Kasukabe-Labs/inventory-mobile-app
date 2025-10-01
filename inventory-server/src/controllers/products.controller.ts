import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export async function ProductController(req: Request, res: Response) {
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
