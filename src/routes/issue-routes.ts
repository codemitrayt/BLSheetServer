import express from "express";

import authenticateJWT from "../middleware/autenticate-jwt";
import asyncFnHandler from "../utils/async-fn-handler";
import logger from "../config/logger";

import { IssueController } from "../controllers";
import {
  AuthService,
  IssueService,
  ProjectMemberService,
  ProjectService,
} from "../services";
import {
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
const issueController = new IssueController(
  authService,
  projectService,
  projectMemberService,
  issueService,
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

export default issueRoute;
