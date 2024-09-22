import { ObjectId } from "mongoose";
import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

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
  ProjectTask,
  ProjectTaskComment,
} from "../types";
import logger from "../config/logger";

class ProjectTaskController {
  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private projectTaskService: ProjectTaskService,
    private projectMemberService: ProjectMemberService,
    private commentService: CommentService
  ) {}

  async createProjectTask(
    req: CustomRequest<ProjectTask>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const projectTask = req.body;

    logger.info({ userId, projectTask });

    const user = await this.authService.findByUserId(userId);
    if (!user) {
      return next(createHttpError(400, "User not found"));
    }

    const project = await this.projectService.findProjectById(
      projectTask.projectId as unknown as string
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    const isProjectMember =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectTask.projectId as unknown as string
      );

    if (!isProjectMember) {
      return next(createHttpError(403, "User is not a member of the project"));
    }

    const newProjectTask = await this.projectTaskService.createProjectTask({
      ...projectTask,
      userId: userId as unknown as ObjectId,
    });

    return res.json({ message: { projectTask: newProjectTask } });
  }

  async getProjectTasks(
    req: CustomRequest<{ objectId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { objectId: projectId } = req.body;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    const project = await this.projectService.findProjectById(
      projectId as unknown as string
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    const isProjectMember =
      await this.projectMemberService.findMemberByUserIdAndProjectId(
        userId,
        projectId
      );
    if (!isProjectMember)
      return next(
        createHttpError(
          400,
          "You do not have permission to get this project task"
        )
      );

    const projectTasks =
      await this.projectTaskService.getProjectTasksByProjectId(
        projectId as unknown as string,
        userId
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
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const projectTaskId = req.query.objectId as string;

    logger.info({ key: "Delete Project Task", userId, projectTaskId });

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    const project = await this.projectService.getProjectById(
      projectTask?.projectId as unknown as string,
      userId
    );

    if (project.isAdmin) {
      await this.projectTaskService.deleteProjectTaskById(projectTaskId);
      return res.json({ message: { projectTaskId } });
    }

    if (projectTask.userId.toString() !== userId) {
      return next(
        createHttpError(
          403,
          "You do not have permission to delete this project task"
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
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { objectId: projectTaskId } = req.query;
    const updatedProjectTask = req.body;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    const projectTask =
      await this.projectTaskService.getProjectTaskByIdAndUserId(
        projectTaskId as unknown as string,
        userId
      );

    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    if (projectTask.userId.toString() !== userId) {
      return next(
        createHttpError(
          403,
          "You do not have permission to update this project task"
        )
      );
    }

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
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { memberEmailId, projectId, projectTaskId } = req.body;

    logger.info({ userId, memberEmailId, projectId, projectTaskId });

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    const project = await this.projectService.findProjectById(
      projectId as unknown as string
    );
    if (!project) return next(createHttpError(400, "Project not found"));

    const projectMember =
      await this.projectMemberService.getProjectMemberByEmailIdAndProjectId(
        memberEmailId,
        projectId
      );
    if (!projectMember) {
      return next(createHttpError(403, "User is not a member of the project"));
    }

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
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectId, projectTaskId, memberEmailId } = req.body;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    const projectTask =
      await this.projectTaskService.getProjectTaskByIdAndUserId(
        projectTaskId,
        userId
      );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    const project = await this.projectService.getProjectById(
      projectTask?.projectId as unknown as string,
      userId
    );

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
      return res.json({ message: "User removed successfully" });
    }

    return next(
      createHttpError(400, "You do not have permission to remove user.")
    );
  }

  async createProjectTaskComment(
    req: CustomRequest<ProjectTaskComment>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectTaskId, content, projectId } = req.body;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(400, "User not found"));

    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    const isMemberExist = await this.projectMemberService.getProjectMember(
      projectId,
      user.email
    );
    if (!isMemberExist) {
      return next(createHttpError(403, "User is not a member of the project"));
    }

    const comment = await this.commentService.createComment({
      content,
      userId: userId as unknown as ObjectId,
    });

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
    }>,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;
    const { projectId, projectTaskId, commentId } = req.body;

    logger.info({ projectId, projectTaskId, commentId });

    const project = await this.projectService.findProjectById(projectId);
    if (!project) return next(createHttpError(400, "Project not found"));

    const projectTask = await this.projectTaskService.getProjectTaskById(
      projectTaskId as unknown as string
    );
    if (!projectTask)
      return next(createHttpError(400, "Project task not found"));

    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return next(createHttpError(400, "Comment not found"));

    logger.info({ projectUserId: project.userId, userId });

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

    await this.projectTaskService.removeComment(
      projectTaskId as string,
      commentId as unknown as string
    );

    return res.json({ message: "Comment deleted successfully" });
  }

  async updateProjectTaskComment() {}
}

export default ProjectTaskController;
