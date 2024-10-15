import { Logger } from "winston";

import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import {
  AuthService,
  IssueService,
  ProjectMemberService,
  ProjectService,
} from "../services";
import { CustomRequest, GetIssuesQuery, Issue } from "../types";
import EVENTS from "../constants/events";

class IssueController {
  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private projectMemberService: ProjectMemberService,
    private issueService: IssueService,
    private logger: Logger
  ) {}

  async getIssue(req: CustomRequest, res: Response, next: NextFunction) {
    const issueId = req.query.issueId as string;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const issue = await this.issueService.findIssueById(issueId, userId);
    if (!issue) return next(createHttpError(400, "Issue not found"));

    res.json({ message: { issue } });
  }

  async getIssues(req: CustomRequest, res: Response, next: NextFunction) {
    /** Validate requrest body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const projectId = req.query.projectId as string;
    const query = req.query as unknown as GetIssuesQuery;

    if (!projectId) return next(createHttpError(400, "Project ID is required"));

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const project = await this.projectService.findProjectById(projectId);
    if (!project) return next(createHttpError(400, "Project not found"));

    const isProjectMember =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectId
      );
    if (!isProjectMember) {
      return next(createHttpError(403, "Forbidden"));
    }

    const data = await this.issueService.findIssuesByProjectId(
      projectId,
      userId,
      isProjectMember._id as unknown as string,
      query
    );
    res.json({ message: data });
  }

  async createIssue(
    req: CustomRequest<Issue>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate requrest body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const issue = req.body;
    const projectId = req.query.projectId as string;

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) {
      return next(createHttpError(400, "User not found"));
    }

    this.logger.info({
      event: EVENTS.CREATE_ISSUE,
      data: { title: issue.title, email: user.email },
    });

    /** Check project */
    const project = await this.projectService.findProjectById(projectId);
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check if user is a member of the project */
    const isProjectMember =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectId
      );
    if (!isProjectMember) {
      return next(
        createHttpError(
          403,
          "You do not have permission to access this project task"
        )
      );
    }

    /** Create project task */
    const newIssue = await this.issueService.createIssue({
      title: issue.title,
      description: issue.description,
      userId,
      projectId,
      labels: issue?.labels || [],
    });

    return res.status(201).json({
      message: {
        issue: newIssue,
      },
    });
  }
  async updateIssue(req: CustomRequest, res: Response, next: NextFunction) {}
  async deleteIssue(req: CustomRequest, res: Response, next: NextFunction) {}
}

export default IssueController;
