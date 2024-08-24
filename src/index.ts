import express from "express";
import cors from "cors";

import Config from "./config";
import connectDB from "./config/db";
import logger from "./config/logger";
import errorHandler from "./middleware/error-handler";
import authRouter from "./routes/auth-routes";

const app = express();

const corsOption: cors.CorsOptions = {
  origin: true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOption));

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await connectDB();
    logger.info("Database connected successfully.");

    app.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      process.exit(1);
    }
  }
};

void startServer();

app.use(express.json());

app.get("/", (req, res) => {
  return res.send("Hello from BLSheet backend!");
});

app.use("/api/v1/auth", authRouter);
app.use(errorHandler);

export default app;
