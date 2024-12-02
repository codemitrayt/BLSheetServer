import express from "express";

import {
  AuthService,
  CommentService,
  NotificationService,
  ProjectMemberService,
  ProjectService,
  ProjectTaskService,
} from "../services";
import {
  CommentModel,
  ProjectMemberModel,
  ProjectModel,
  ProjectTaskModel,
  UserModel,
} from "../model";
import { ProjectTaskController } from "../controllers";
import asyncFnHandler from "../utils/async-fn-handler";
import authenticateJWT from "../middleware/autenticate-jwt";
import validators from "../validator";
import logger from "../config/logger";

const projectTaskRouter = express.Router();

const projectService = new ProjectService(ProjectModel);
const projectTaskService = new ProjectTaskService(ProjectTaskModel);
const authService = new AuthService(UserModel);
const projectMemberService = new ProjectMemberService(ProjectMemberModel);
const commentService = new CommentService(CommentModel);
const notificationService = new NotificationService();

const projectTaskController = new ProjectTaskController(
  authService,
  projectService,
  projectTaskService,
  projectMemberService,
  commentService,
  notificationService,
  logger
);

projectTaskRouter.get(
  "/getProjectTask",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTask(req, res, next)
  )
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
  validators.getProjectTaskQueryValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTasks(req, res, next)
  )
);

projectTaskRouter.put(
  "/updateProjectTask",
  validators.projectTaskBodyValidator,
  validators.objectIdQueryValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.updateProjectTask(req, res, next)
  )
);

projectTaskRouter.delete(
  "/deleteProjectTask",
  validators.objectIdQueryValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.deleteProjectTask(req, res, next)
  )
);

projectTaskRouter.post(
  "/assignUserToProjectTask",
  validators.assignMemberToProjectTaskBodyValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.assignUserToProjectTask(req, res, next)
  )
);

projectTaskRouter.delete(
  "/removeAssignedUserFormProjectTask",
  validators.assignMemberToProjectTaskBodyValidator,
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.removeAssignedUserFormProjectTask(req, res, next)
  )
);

projectTaskRouter.post(
  "/createProjectTaskComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.createProjectTaskComment(req, res, next)
  )
);

projectTaskRouter.post(
  "/getProjectTaskComments",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTaskComments(req, res, next)
  )
);

projectTaskRouter.delete(
  "/deleteProjectTaskComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.deleteProjectTaskComment(req, res, next)
  )
);

projectTaskRouter.put(
  "/updateProjectTaskComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.updateProjectTaskComment(req, res, next)
  )
);

projectTaskRouter.post(
  "/getProjectTaskForUser",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTaskForUser(req, res, next)
  )
);

projectTaskRouter.post(
  "/replyToProjectTaskComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.replyToProjectTaskComment(req, res, next)
  )
);

projectTaskRouter.post(
  "/getProjectTaskCommentReplies",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    projectTaskController.getProjectTaskCommentReplies(req, res, next)
  )
);

export default projectTaskRouter;
