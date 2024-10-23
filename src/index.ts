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
  issueRouters,
} from "./routes";
import EVENTS from "./constants/events";

const app = express();
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: [Config.FRONTEND_URL!, Config.WWW_FRONTEND_URL!],
    // origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

io.on("connection", (socket) => {
  logger.info({ msg: "USER CONNECTED", socketId: socket.id });

  socket.on("join", (data: { projectId: string }) => {
    logger.info({ msg: "User joined project", projectId: data.projectId });
    socket.join(data.projectId);
    socket.emit("join", { roomId: data.projectId });
  });

  socket.on("disconnect", () => {
    logger.info({ msg: "User disconnected", socketId: socket.id });
  });
});

const corsOption: cors.CorsOptions = {
  origin: [Config.FRONTEND_URL!, Config.WWW_FRONTEND_URL!],
  // origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOption));
app.options("*", cors(corsOption));

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

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  logger.info({ event: EVENTS.WORKING });
  return res.send("Hello from BLSheet backend!");
});

app.get("/hello", (req, res) => {
  logger.info({ event: EVENTS.HELLO });
  return res.send("Hello from BLSheet backend!");
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/blSheet", blSheetRoutes);
app.use("/api/v1/todo", todoRoutes);
app.use("/api/v1/project", projectRouters);
app.use("/api/v1/projectTask", projectTaskRouters);
app.use("/api/v1/issue", issueRouters);

app.use(errorHandler);

void startServer();

export default app;
