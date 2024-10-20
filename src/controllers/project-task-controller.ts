import { ObjectId } from "mongoose";
import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { Logger } from "winston";
import createHttpError from "http-errors";

import { io } from "..";
import {
  AuthService,
  CommentService,
  ProjectMemberService,
  ProjectService,
  ProjectTaskService,
} from "../services";
import {
  AssignUserToProjectTask,
  CustomRequest,
  GetProjectTaskQuery,
  ProjectTask,
  ProjectTaskComment,
} from "../types";
import EVENTS from "../constants/events";

class ProjectTaskController {
  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private projectTaskService: ProjectTaskService,
    private projectMemberService: ProjectMemberService,
    private commentService: CommentService,
    private logger: Logger
  ) {}

  async createProjectTask(
    req: CustomRequest<ProjectTask>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate requrest body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const projectTask = req.body;

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) {
      return next(createHttpError(400, "User not found"));
    }

    this.logger.info({
      event: EVENTS.CREATE_PROJECT_TASK,
      data: { projectTask, email: user.email },
    });

    /** Check project */
    const project = await this.projectService.findProjectById(
      projectTask.projectId as unknown as string
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check if user is a member of the project */
    const isProjectMember =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectTask.projectId as unknown as string
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
    const newProjectTask = await this.projectTaskService.createProjectTask({
      ...projectTask,
      userId: userId as unknown as ObjectId,
    });

    /** Socket event emit for create task */
    io.to(projectTask.projectId as unknown as string).emit("CREATED_TASK", {
      _id: newProjectTask._id,
      title: newProjectTask.title,
      description: newProjectTask.description,
      startDate: newProjectTask.startDate,
      endDate: newProjectTask.endDate,
      tags: newProjectTask.tags,
      status: newProjectTask.status,
      priority: newProjectTask.priority,
      userId: newProjectTask.userId,
      projectId: newProjectTask.projectId,
      completedDate: null,
      assignedMembers: [],
      commentCount: 0,
      user: {
        _id: userId,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });

    return res.json({ message: { projectTask: newProjectTask } });
  }

  async getProjectTasks(
    req: CustomRequest<{ objectId: string }>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { objectId: projectId } = req.body;
    const query = req.query as unknown as GetProjectTaskQuery;

    this.logger.info({ event: EVENTS.GET_PROJECT_TASKS, data: { userId } });

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check project */
    const project = await this.projectService.findProjectById(
      projectId as unknown as string
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check if user is a member of the project */
    const isProjectMember =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectId
      );
    if (!isProjectMember)
      return next(
        createHttpError(
          403,
          "You do not have permission to access this project task"
        )
      );

    /**  Get project task */
    const projectTasks =
      await this.projectTaskService.getProjectTasksByProjectId(
        projectId as unknown as string,
        userId,
        isProjectMember._id as unknown as string,
        query
      );

    return res.json({
      message: {
        projectTasks,
        project,
      },
    });
  }

  async deleteProjectTask(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const projectTaskId = req.query.objectId as string;

    this.logger.info({
      event: EVENTS.DELETE_PROJECT_TASK,
      data: { userId, projectTaskId },
    });

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check project task */
    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    /** Check project */
    const project = await this.projectService.getProjectById(
      projectTask?.projectId as unknown as string,
      userId
    );

    /** Check Permission */
    if (project.isAdmin) {
      await this.projectTaskService.deleteProjectTaskById(projectTaskId);
      return res.json({ message: { projectTaskId } });
    }

    if (projectTask.userId.toString() !== userId) {
      return next(
        createHttpError(
          403,
          "You do not have permission to access this project task"
        )
      );
    }

    await this.projectTaskService.deleteProjectTask(projectTaskId, userId);
    return res.json({ message: { projectTaskId: projectTask._id } });
  }

  async updateProjectTask(
    req: CustomRequest<ProjectTask>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { objectId: projectTaskId } = req.query;
    const updatedProjectTask = req.body;

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Update project task */
    await this.projectTaskService.updateProjectTask(
      projectTaskId as string,
      updatedProjectTask
    );

    return res.json({ message: { projectTask: updatedProjectTask } });
  }

  async assignUserToProjectTask(
    req: CustomRequest<AssignUserToProjectTask>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { memberEmailId, projectId, projectTaskId } = req.body;

    this.logger.info({
      event: EVENTS.ASSIGN_MEMBER_TO_PROJECT_TASK,
      data: { userId, projectId, projectTaskId },
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

    /** Check if user is already assigned to the project task */
    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId
    );
    if (!projectTask)
      return next(createHttpError(400, "ProjectTask not found"));

    await this.projectTaskService.assignMember(
      projectTask._id as unknown as string,
      projectMember._id as unknown as string
    );

    return res.json({ message: "Project task member assigned successfully" });
  }

  async removeAssignedUserFormProjectTask(
    req: CustomRequest<AssignUserToProjectTask>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request validator */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectId, projectTaskId, memberEmailId } = req.body;

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check project task */
    const projectTask =
      await this.projectTaskService.getProjectTaskByIdAndUserId(
        projectTaskId,
        userId
      );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    /** Check project */
    const project = await this.projectService.getProjectById(
      projectTask?.projectId as unknown as string,
      userId
    );

    /** Check member */
    const member =
      await this.projectMemberService.getProjectMemberByEmailIdAndProjectId(
        memberEmailId,
        projectId
      );
    if (!member) return next(createHttpError(400, "Project member not found"));

    if (project.isAdmin || projectTask.userId.toString() === userId) {
      await this.projectTaskService.removeMember(
        projectTask._id as unknown as string,
        member._id as unknown as string
      );
      return res.json({ message: "Assign member removed successfully." });
    }

    return next(
      createHttpError(403, "You do not have permission to remove user.")
    );
  }

  async createProjectTaskComment(
    req: CustomRequest<ProjectTaskComment>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectTaskId, content, projectId } = req.body;

    this.logger.info({
      event: EVENTS.CREATE_PROJECT_TASK_COMMENT,
      data: { userId, projectTaskId, projectId, content },
    });

    /** Check User */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check Project Task */
    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

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
      objectId: projectTaskId as unknown as ObjectId,
      commentType: "PROJECT_TASK",
      userId: userId as unknown as ObjectId,
    });

    // TODO: add socket io

    await this.projectTaskService.addComment(
      projectTaskId as string,
      comment._id as unknown as string
    );

    return res.json({ message: { comment } });
  }

  async getProjectTaskComments(
    req: CustomRequest<{ projectTaskId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { projectTaskId } = req.body;

    this.logger.info({
      event: EVENTS.GET_PROJECT_TASK_COMMENT,
      data: { userId },
    });

    /** Check Project Task */
    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    const comments = await this.projectTaskService.getComments(
      projectTaskId as unknown as string,
      userId
    );

    return res.json({ message: { projectTask: comments } });
  }

  async deleteProjectTaskComment(
    req: CustomRequest<{
      projectId: string;
      projectTaskId: string;
      commentId: string;
      parentCommentId?: string;
    }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { projectId, projectTaskId, commentId, parentCommentId } = req.body;

    this.logger.info({
      event: EVENTS.DELETE_PROJECT_TASK_COMMENT,
      data: { projectId, projectTaskId, commentId },
    });

    /** Check Project */
    const project = await this.projectService.findProjectById(projectId);
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check Project Task */
    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

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

    await this.projectTaskService.removeComment(
      projectTaskId as string,
      commentId as unknown as string
    );

    return res.json({ message: "Comment deleted successfully" });
  }

  async updateProjectTaskComment(
    req: CustomRequest<ProjectTaskComment & { commentId: string }>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectTaskId, content, commentId, projectId } = req.body;

    this.logger.info({
      event: EVENTS.UPDATE_PROJECT_TASK_COMMENT,
      data: { userId, content, commentId },
    });

    /** Check project task */
    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

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

  async getProjectTaskForUser(
    req: CustomRequest<{ projectId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { projectId } = req.body;

    /** Check user */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check project */
    const project = await this.projectService.getProjectById(
      projectId as unknown as string,
      userId
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    /** Check Member */
    const member =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectId
      );
    if (!member) return next(createHttpError(400, "Member not found"));

    /** Get Project Task */
    const projectTasks = await this.projectTaskService.getAssignedProjectTasks(
      projectId as unknown as string,
      member._id as string
    );

    return res.json({ message: { projectTasks } });
  }

  async replyToProjectTaskComment(
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
      event: EVENTS.REPLY_TO_PROJECT_TASK_COMMENT,
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
      commentType: "PROJECT_TASK",
      userId: userId as unknown as ObjectId,
    });

    /** Add reply comment */
    const reply = await this.commentService.replyToComment(
      commentId,
      replyCooment._id as unknown as ObjectId
    );

    return res.json({ message: { reply: replyCooment } });
  }

  async getProjectTaskCommentReplies(
    req: CustomRequest<{
      commentId: string;
    }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { commentId } = req.body;

    this.logger.info({
      event: EVENTS.GET_PROJECT_TASK_COMMENT_REPLIES,
      data: { userId, commentId },
    });

    /** Check User */
    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check Comment */
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return next(createHttpError(400, "Comment not found"));

    const replies = await this.commentService.getReplies(commentId, userId);

    return res.json({ message: { projectTaskComment: replies } });
  }
}

export default ProjectTaskController;
