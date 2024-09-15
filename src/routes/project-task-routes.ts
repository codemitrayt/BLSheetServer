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
import validators from "../validator";

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
  validators.projectTaskBodyValidator,
  asyncFnHandler((req, res, next) =>
    projectTaskController.createProjectTask(req, res, next)
  )
);

projectTaskRouter.post(
  "/getProjectTasks",
  validators.objectIdBodyValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTasks(req, res, next)
  )
);

export default projectTaskRouter;
