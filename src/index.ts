import app from "./app";
import Config from "./config";
import connectDB from "./config/db";
import logger from "./config/logger";

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
