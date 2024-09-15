import { NextFunction, Response } from "express";
import {
  AuthService,
  ProjectMemberService,
  ProjectService,
  ProjectTaskService,
} from "../services";
import { CustomRequest, ProjectTask } from "../types";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import logger from "../config/logger";
import { ObjectId } from "mongoose";

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
    req: CustomRequest<{ projectId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const userId = req.userId as string;
    const { projectId } = req.body;

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
        projectId as unknown as string
      );

    return res.json({ message: { projectTasks } });
  }
}

export default ProjectTaskController;
