import "dotenv/config";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuthRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.use("/api", AuthRouter);

app.listen(3000, () => {
  console.log("Server started on port:" + 3000);
});
