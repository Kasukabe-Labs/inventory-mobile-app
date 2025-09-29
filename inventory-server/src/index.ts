import "dotenv/config";
import express from "express";
import morgan from "morgan";
import AuthRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json());

morgan("dev");

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.use("/api", AuthRouter);

app.listen(3000, () => {
  console.log("Server started on port:" + 3000);
});
