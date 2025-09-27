import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hi there");
});

app.listen(3000, () => {
  console.log("Server started on port:" + 3000);
});
