import express from "express";

import authenticateJWT from "../middleware/autenticateJwt.middleware";
import asyncFnHandler from "../utils/async-fn-handler";
import logger from "../config/logger";

import { IssueController } from "../controllers";
import {
  AuthService,
  CommentService,
  IssueService,
  ProjectMemberService,
  ProjectService,
} from "../services";
import {
  CommentModel,
  IssueModel,
  ProjectMemberModel,
  ProjectModel,
  UserModel,
} from "../model";
import validators from "../validator";

const issueRoute = express.Router();
const issueService = new IssueService(IssueModel);
const projectMemberService = new ProjectMemberService(ProjectMemberModel);
const authService = new AuthService(UserModel);
const projectService = new ProjectService(ProjectModel);
const commentService = new CommentService(CommentModel);
const issueController = new IssueController(
  authService,
  projectService,
  projectMemberService,
  issueService,
  commentService,
  logger
);

/**
 * url: http://localhost:5500/api/v1/issues/getIssue?issueId=123
 * method: GET
 * params : { issueId: 123 }
 * response : {message: : {issue : Issue}}
 */

issueRoute.get(
  "/getIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) => issueController.getIssue(req, res, next))
);

/**
 * url: http://localhost:5500/api/v1/issues/getIssues?projectId=123
 * method: GET
 * params : { projectId: 123 }
 * response : {message: : {issues : Issue[]}}
 */

issueRoute.get(
  "/getIssues",
  authenticateJWT,
  validators.getIssuesQueryValidator,
  asyncFnHandler((req, res, next) => issueController.getIssues(req, res, next))
);

/**
 * url: http://localhost:5500/api/v1/issues/createIssue?projectId=123
 * method: POST
 * body: Issue
 * params : { projectId: 123 }
 * response : {message: : {issue : Issue}}
 */

issueRoute.post(
  "/createIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.createIssue(req, res, next)
  )
);

/**
 * url: http://localhost:5500/api/v1/issues/closeIssue?projectId=123&issueId=123
 * method: POST
 * body: {status: "open" | "closed"}
 * params : { projectId: 123, issueId: 123 }
 * response : {message: : {msg : "Issue closed successfully"}}
 */

issueRoute.post(
  "/changeStatusIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.changeStatusIssue(req, res, next)
  )
);

issueRoute.put(
  "/updateIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.updateIssue(req, res, next)
  )
);

issueRoute.delete(
  "/deleteIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.deleteIssue(req, res, next)
  )
);

issueRoute.post(
  "/assignUserToIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.assignUserToIssue(req, res, next)
  )
);

issueRoute.delete(
  "/removeAssignedUserFormIssue",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.removeAssignedUserFormIssue(req, res, next)
  )
);

issueRoute.post(
  "/createIssueComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.createIssueComment(req, res, next)
  )
);

issueRoute.post(
  "/getIssueComments",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.getIssueComments(req, res, next)
  )
);

issueRoute.delete(
  "/deleteIssueComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.deleteIssueComment(req, res, next)
  )
);

issueRoute.put(
  "/updateIssueComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.updateIssueComment(req, res, next)
  )
);

issueRoute.post(
  "/replyToIssueComment",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.replyToIssueComment(req, res, next)
  )
);

issueRoute.post(
  "/getIssueCommentReplies",
  authenticateJWT,
  asyncFnHandler((req, res, next) =>
    issueController.getIssueCommentReplies(req, res, next)
  )
);

export default issueRoute;
