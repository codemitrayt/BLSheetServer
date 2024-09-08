import express from "express";

import { ProjectController } from "../controllers";
import asyncFnHandler from "../utils/async-fn-handler";
import authenticateJWT from "../middleware/autenticate-jwt";

const projectRouter = express.Router();
const projectController = new ProjectController();

projectRouter.get(
  "/getProject",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectController.getProject(req, res, next)
  )
);

projectRouter.get(
  "/getProjectList",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectController.getProjectList(req, res, next)
  )
);

projectRouter.post(
  "/createProject",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectController.createProject(req, res, next)
  )
);

projectRouter.put(
  "/updateProject",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectController.updateProject(req, res, next)
  )
);

projectRouter.delete(
  "/deleteProject",
  asyncFnHandler((req, res, next) =>
    projectController.deleteProject(req, res, next)
  )
);

export default projectRouter;
