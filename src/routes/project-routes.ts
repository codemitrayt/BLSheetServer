import express from "express";

import { ProjectController } from "../controllers";
import asyncFnHandler from "../utils/async-fn-handler";
import authenticateJWT from "../middleware/autenticate-jwt";
import { AuthService, ProjectService } from "../services";
import { ProjectModel, UserModel } from "../model";
import validators from "../validator";
import { CustomRequest } from "../types";

const projectRouter = express.Router();
const authService = new AuthService(UserModel);
const projectService = new ProjectService(ProjectModel);
const projectController = new ProjectController(projectService, authService);

projectRouter.get(
  "/getProject",
  authenticateJWT,
  validators.objectIdQueryValidator,
  asyncFnHandler((req, res, next) =>
    projectController.getProject(req as CustomRequest, res, next)
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
  validators.projectBodyValidator,
  asyncFnHandler((req, res, next) =>
    projectController.createProject(req, res, next)
  )
);

projectRouter.put(
  "/updateProject",
  validators.projectBodyValidator,
  validators.objectIdQueryValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectController.updateProject(req, res, next)
  )
);

projectRouter.delete(
  "/deleteProject",
  authenticateJWT,
  validators.deleteObjectBodyValidator,
  asyncFnHandler((req, res, next) =>
    projectController.deleteProject(req, res, next)
  )
);

export default projectRouter;
