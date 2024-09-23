import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { Server } from "socket.io";

import Config from "./config";
import connectDB from "./config/db";
import logger from "./config/logger";
import errorHandler from "./middleware/error-handler";

import {
  authRoutes,
  todoRoutes,
  blSheetRoutes,
  projectRouters,
  projectTaskRouters,
} from "./routes";

const app = express();
const server = createServer(app);
export const io = new Server(server, {
  cors: {
    origin: [Config.FRONTEND_URL!],
    credentials: true,
  },
});

const corsOption: cors.CorsOptions = {
  origin: [Config.FRONTEND_URL!],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOption));

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    await connectDB();
    logger.info("Database connected successfully.");

    server.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
      process.exit(1);
    }
  }
};

void startServer();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  return res.send("Hello from BLSheet backend!");
});

io.on("connection", (socket) => {
  logger.info({ msg: "User connected", socketId: socket.id });
  socket.on("join", (data: { projectId: string }) => {
    logger.info({ msg: "User joined in", id: data.projectId });
    socket.join(data.projectId.toString());
    socket.emit("join", { roomId: data.projectId });
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blSheet", blSheetRoutes);
app.use("/api/v1/todo", todoRoutes);
app.use("/api/v1/project", projectRouters);
app.use("/api/v1/projectTask", projectTaskRouters);
app.use(errorHandler);

export default app;
