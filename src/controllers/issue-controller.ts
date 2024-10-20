import { Logger } from "winston";

import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import {
  AuthService,
  CommentService,
  IssueService,
  ProjectMemberService,
  ProjectService,
} from "../services";
import {
  AssignUserToIssue,
  ChangeStatusIssueBody,
  ChangeStatusIssueQuery,
  CustomRequest,
  GetIssuesQuery,
  Issue,
  IssueComment,
} from "../types";
import EVENTS from "../constants/events";
import { ObjectId } from "mongoose";

class IssueController {
  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private projectMemberService: ProjectMemberService,
    private issueService: IssueService,
    private commentService: CommentService,
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

    const issueCounts = await this.issueService.issueCounts(projectId);

    const data = await this.issueService.findIssuesByProjectId(
      projectId,
      userId,
      isProjectMember._id as unknown as string,
      query
    );
    res.json({ message: { ...data, issueCounts } });
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
          "You do not have permission to access this project ISSUE"
        )
      );
    }

    /** Create project ISSUE */
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

  async changeStatusIssue(
    req: CustomRequest<ChangeStatusIssueBody>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { projectId, issueId } =
      req.query as unknown as ChangeStatusIssueQuery;
    const { status } = req.body;

    const project = await this.projectService.getProjectById(projectId, userId);
    if (!project) return next(createHttpError(400, "Project not found"));

    if (!project.isAdmin)
      return next(
        createHttpError(401, "You have no permission to close this issue")
      );

    const issue = await this.issueService.findIssueById(issueId, userId);
    if (!issue) return next(createHttpError(400, "Issue not found"));

    await this.issueService.changeStatusIssue(issueId, status, userId);

    return res.json({ message: { msg: "Issue closed successfully", issueId } });
  }

  async updateIssue(req: CustomRequest, res: Response, next: NextFunction) {}
  async deleteIssue(req: CustomRequest, res: Response, next: NextFunction) {}

  async assignUserToIssue(
    req: CustomRequest<AssignUserToIssue>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { memberEmailId, projectId, issueId } = req.body;

    this.logger.info({
      event: EVENTS.ASSIGN_MEMBER_TO_PROJECT_ISSUE,
      data: { userId, projectId, issueId },
    });

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check project  */
    const project = await this.projectService.findProjectById(
      projectId as unknown as string
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check project member */
    const projectMember =
      await this.projectMemberService.getProjectMemberByEmailIdAndProjectId(
        memberEmailId,
        projectId
      );
    if (!projectMember) {
      return next(createHttpError(403, "User is not a member of the project"));
    }

    /** Check if user is already assigned to the project ISSUE */
    const issue = await this.issueService.getIssueById(issueId);
    if (!issue) return next(createHttpError(400, "Issue not found"));

    await this.issueService.assignMember(
      issue._id as unknown as string,
      projectMember._id as unknown as string
    );

    return res.json({ message: "Assigned member successfully" });
  }

  async removeAssignedUserFormIssue(
    req: CustomRequest<AssignUserToIssue>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request validator */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectId, issueId, memberEmailId } = req.body;

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check project ISSUE */
    const issue = await this.issueService.getIssueByIdAndUserId(
      issueId,
      userId
    );
    if (!issue) return next(createHttpError(400, "Project ISSUE not found"));

    /** Check project */
    const project = await this.projectService.getProjectById(
      issue?.projectId as unknown as string,
      userId
    );

    /** Check member */
    const member =
      await this.projectMemberService.getProjectMemberByEmailIdAndProjectId(
        memberEmailId,
        projectId
      );
    if (!member) return next(createHttpError(400, "Project member not found"));

    if (project.isAdmin) {
      await this.issueService.removeMember(
        issue._id as unknown as string,
        member._id as unknown as string
      );
      return res.json({ message: "Assignee member removed successfully." });
    }

    return next(
      createHttpError(403, "You do not have permission to remove user.")
    );
  }

  async createIssueComment(
    req: CustomRequest<IssueComment>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { issueId, content, projectId } = req.body;

    this.logger.info({
      event: EVENTS.CREATE_PROJECT_ISSUE_COMMENT,
      data: { userId, issueId, projectId, content },
    });

    /** Check User */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check Project ISSUE */
    const issue = await this.issueService.getIssueById(
      issueId as unknown as string
    );
    if (!issue) return next(createHttpError(400, "Project Issue not found"));

    /** Check Member */
    const isMemberExist = await this.projectMemberService.getProjectMember(
      projectId,
      user.email
    );
    if (!isMemberExist) {
      return next(createHttpError(403, "User is not a member of the project"));
    }

    /** Create Comment */
    const comment = await this.commentService.createComment({
      content,
      objectId: issueId as unknown as ObjectId,
      commentType: "PROJECT_ISSUE",
      userId: userId as unknown as ObjectId,
    });

    // TODO: add socket io

    await this.issueService.addComment(
      issueId as string,
      comment._id as unknown as string
    );

    return res.json({ message: { comment } });
  }

  async getIssueComments(
    req: CustomRequest<{ issueId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { issueId } = req.body;

    this.logger.info({
      event: EVENTS.GET_PROJECT_ISSUE_COMMENT,
      data: { userId },
    });

    /** Check Project ISSUE */
    const issue = await this.issueService.getIssueById(
      issueId as unknown as string
    );
    if (!issue) return next(createHttpError(400, "Issue not found"));

    const comments = await this.issueService.getComments(
      issueId as unknown as string,
      userId
    );

    return res.json({ message: { issue: comments } });
  }

  async deleteIssueComment(
    req: CustomRequest<{
      projectId: string;
      issueId: string;
      commentId: string;
      parentCommentId?: string;
    }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { projectId, issueId, commentId, parentCommentId } = req.body;

    this.logger.info({
      event: EVENTS.DELETE_PROJECT_ISSUE_COMMENT,
      data: { projectId, issueId, commentId },
    });

    /** Check Project */
    const project = await this.projectService.findProjectById(projectId);
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check Project ISSUE */
    const issue = await this.issueService.getIssueById(
      issueId as unknown as string
    );
    if (!issue) return next(createHttpError(400, "Project ISSUE not found"));

    /** Check Comment */
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return next(createHttpError(400, "Comment not found"));

    /** Check Permission */
    if (
      comment.userId.toString() !== userId &&
      project.userId.toString() !== userId
    ) {
      return next(
        createHttpError(
          403,
          "You do not have permission to delete this comment"
        )
      );
    }

    await this.commentService.deleteComment(commentId);

    if (parentCommentId) {
      await this.commentService.removeReply(parentCommentId, commentId);
    }

    await this.issueService.removeComment(
      issueId as string,
      commentId as unknown as string
    );

    return res.json({ message: "Comment deleted successfully" });
  }

  async updateIssueComment(
    req: CustomRequest<IssueComment & { commentId: string }>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { issueId, content, commentId, projectId } = req.body;

    this.logger.info({
      event: EVENTS.UPDATE_PROJECT_ISSUE_COMMENT,
      data: { userId, content, commentId },
    });

    /** Check project ISSUE */
    const issue = await this.issueService.getIssueById(
      issueId as unknown as string
    );
    if (!issue) return next(createHttpError(400, "Project ISSUE not found"));

    /** Check comment */
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return next(createHttpError(400, "Comment not found"));

    /** Check project */
    const project = await this.projectService.getProjectById(projectId, userId);
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check permission  */
    if (comment.userId.toString() !== userId && !project.isAdmin) {
      return next(
        createHttpError(
          403,
          "You do not have permission to update this comment"
        )
      );
    }

    /** Update comment */
    const updatedComment = await this.commentService.updateComment(commentId, {
      content,
    });
    return res.json({ message: { comment: updatedComment } });
  }

  async replyToIssueComment(
    req: CustomRequest<{
      commentId: string;
      content: string;
    }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { commentId, content } = req.body;

    this.logger.info({
      event: EVENTS.REPLY_TO_PROJECT_ISSUE_COMMENT,
      data: { userId, commentId, content },
    });

    /** Check User */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check Comment */
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return next(createHttpError(400, "Comment not found"));

    /** Create comment */
    const replyCooment = await this.commentService.createComment({
      content,
      objectId: comment.objectId,
      commentType: "PROJECT_ISSUE",
      userId: userId as unknown as ObjectId,
    });

    /** Add reply comment */
    const reply = await this.commentService.replyToComment(
      commentId,
      replyCooment._id as unknown as ObjectId
    );

    return res.json({ message: { reply: replyCooment } });
  }

  async getIssueCommentReplies(
    req: CustomRequest<{
      commentId: string;
    }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { commentId } = req.body;

    this.logger.info({
      event: EVENTS.GET_PROJECT_ISSUE_COMMENT_REPLIES,
      data: { userId, commentId },
    });

    /** Check User */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check Comment */
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return next(createHttpError(400, "Comment not found"));

    const replies = await this.commentService.getReplies(commentId, userId);

    return res.json({ message: { issueComment: replies } });
  }
}

export default IssueController;
