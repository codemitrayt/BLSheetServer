import express from "express";
import errorHandler from "./middleware/error-handler";

const app = express();

app.get("/", (req, res) => {
  return res.send("Hello from BLSheet backend!");
});

app.use(errorHandler);

export default app;
