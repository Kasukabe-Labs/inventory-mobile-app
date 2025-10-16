import "dotenv/config";
import express from "express";
import morgan from "morgan";
import AuthRouter from "./routes/auth.route.js";
import ProductRouter from "./routes/products.route.js";
import { EmployeeRouter } from "./routes/employees.route.js";
import { CategoryRouter } from "./routes/category.route.js";

const app = express();
app.use(express.json());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.use("/api", AuthRouter);
app.use("/api/products", ProductRouter);
app.use("/api/employees", EmployeeRouter);
app.use("/api/categories", CategoryRouter);

app.listen(3000, () => {
  console.log("Server started on port:" + 3000);
});
