import { Router } from "express";
import { authenticate } from "../middlewares/verify.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "../controllers/employees.controller.js";

const EmployeeRouter = Router();

EmployeeRouter.post("/add", authenticate, isAdmin, addEmployee);

EmployeeRouter.put("/update", authenticate, isAdmin, updateEmployee);

EmployeeRouter.get("/get-all", authenticate, isAdmin, getAllEmployees);

EmployeeRouter.delete("/delete", authenticate, isAdmin, deleteEmployee);

export { EmployeeRouter };
