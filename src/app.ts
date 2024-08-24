import express from "express";
import errorHandler from "./middleware/error-handler";
import authRouter from "./routes/auth-routes";

const app = express();

app.use(express.json());
app.use("/api/v1/auth", authRouter);

app.get("/", (req, res) => {
  return res.send("Hello from BLSheet backend!");
});

app.use(errorHandler);

export default app;
