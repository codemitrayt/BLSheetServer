import express from "express";

import asyncFnHandler from "../utils/async-fn-handler";
import authenticateJWT from "../middleware/autenticate-jwt";
import validators from "../validator";

import {
  AuthService,
  NotificationService,
  ProjectMemberService,
  ProjectService,
  TokenService,
} from "../services";
import { ProjectMemberModel, ProjectModel, UserModel } from "../model";
import { ProjectController } from "../controllers";
import { CustomRequest, InviteTeamMemberType } from "../types";

const projectRouter = express.Router();
const authService = new AuthService(UserModel);
const projectService = new ProjectService(ProjectModel);
const notificationService = new NotificationService();
const tokenService = new TokenService();
const projectMemberService = new ProjectMemberService(ProjectMemberModel);
const projectController = new ProjectController(
  projectService,
  authService,
  tokenService,
  notificationService,
  projectMemberService
);

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

projectRouter.post(
  "/inviteTeamMember",
  authenticateJWT,
  validators.inviteProjectMemberValidator,
  asyncFnHandler((req, res, next) =>
    projectController.inviteTeamMember(
      req as CustomRequest<InviteTeamMemberType>,
      res,
      next
    )
  )
);

projectRouter.post(
  "/getProjectMembers",
  authenticateJWT,
  validators.objectIdBodyValidator,
  asyncFnHandler((req, res, next) =>
    projectController.getProjectMembers(req, res, next)
  )
);

projectRouter.put(
  "/updateProjectMember",
  authenticateJWT,
  validators.updateProjectMemberValidator,
  asyncFnHandler((req, res, next) =>
    projectController.updateProjectMember(req, res, next)
  )
);

export default projectRouter;
