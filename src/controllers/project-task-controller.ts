import { ObjectId } from "mongoose";
import { NextFunction, Response } from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

import {
  AuthService,
  ProjectMemberService,
  ProjectService,
  ProjectTaskService,
} from "../services";
import { AssignUserToProjectTask, CustomRequest, ProjectTask } from "../types";
import logger from "../config/logger";

class ProjectTaskController {
  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private projectTaskService: ProjectTaskService,
    private projectMemberService: ProjectMemberService
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
}

export default ProjectTaskController;
