import express from "express";

import {
  AuthService,
  ProjectMemberService,
  ProjectService,
  ProjectTaskService,
} from "../services";
import {
  ProjectMemberModel,
  ProjectModel,
  ProjectTaskModel,
  UserModel,
} from "../model";
import { ProjectTaskController } from "../controllers";
import asyncFnHandler from "../utils/async-fn-handler";
import authenticateJWT from "../middleware/autenticate-jwt";

const projectTaskRouter = express.Router();

const projectService = new ProjectService(ProjectModel);
const projectTaskService = new ProjectTaskService(ProjectTaskModel);
const authService = new AuthService(UserModel);
const projectMemberService = new ProjectMemberService(ProjectMemberModel);

const projectTaskController = new ProjectTaskController(
  authService,
  projectService,
  projectTaskService,
  projectMemberService
);

projectTaskRouter.post(
  "/createProjectTask",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.createProjectTask(req, res, next)
  )
);

projectTaskRouter.post(
  "/getProjectTasks",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTasks(req, res, next)
  )
);

export default projectTaskRouter;
