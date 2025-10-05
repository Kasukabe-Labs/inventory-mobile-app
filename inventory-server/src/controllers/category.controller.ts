import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required." });
    }

    const existingCategory = await prisma.category.findUnique({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const newCategory = await prisma.category.create({
      data: { name: name.trim() },
    });

    return res.status(201).json({
      message: "Category added successfully.",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const editCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const { name } = req.body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    const updated = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.json({ success: true, message: "Category updated", data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    const existing = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existing)
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });

    // Delete all products under this category first
    await prisma.product.deleteMany({
      where: { categoryId: id },
    });

    // Then delete the category itself
    await prisma.category.delete({ where: { id } });

    res.json({ success: true, message: "Category and its products deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
