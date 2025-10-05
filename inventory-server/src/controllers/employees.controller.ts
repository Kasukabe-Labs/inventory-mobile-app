import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export const addEmployee = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create employee
    const employee = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "EMPLOYEE",
      },
    });

    res.status(201).json({
      message: "Employee created successfully.",
      employee: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        createdAt: employee.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error adding employee:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    const { id, name, email, password } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    // Find the employee
    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee || employee.role !== "EMPLOYEE") {
      return res.status(404).json({ message: "Employee not found." });
    }

    // Check if email is being changed and already exists
    if (email && email !== employee.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use." });
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name ?? employee.name,
      email: email ?? employee.email,
    };

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update employee
    const updatedEmployee = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      message: "Employee updated successfully.",
      employee: updatedEmployee,
    });
  } catch (error: any) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllEmployees = async (_req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(employees);
  } catch (error: any) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(404).json({ message: "ID not found" });
      return;
    }

    const employee = await prisma.user.findUnique({ where: { id } });
    if (!employee || employee.role !== "EMPLOYEE") {
      return res.status(404).json({ message: "Employee not found." });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: "Employee deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
