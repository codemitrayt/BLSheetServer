import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { ObjectId } from "mongoose";

import { AuthService, ProjectService } from "../services";
import { CustomRequest, Project } from "../types";

class ProjectController {
  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  async getProject(req: CustomRequest, res: Response, next: NextFunction) {
    const userId = req.userId as string;
    const projectId = req.params.objectId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const result = await this.projectService.getProject(projectId, userId);
    return res.json({
      message: {
        project: result,
      },
    });
  }

  async getProjectList(req: CustomRequest, res: Response, next: NextFunction) {
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const result = await this.projectService.getProjectList(userId);
    return res.json({
      message: {
        projects: result,
      },
    });
  }

  async createProject(
    req: CustomRequest<Project>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const project = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const newProject = await this.projectService.createProject({
      ...project,
      userId: userId as unknown as ObjectId,
    });

    return res.json({
      message: {
        project: newProject,
      },
    });
  }

  async updateProject(
    req: CustomRequest<Project>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const project = req.body;
    const userId = req.userId as string;
    const projectId = req.query.objectId as string;

    const existingProject = await this.projectService.findBySheetIdAndUserId(
      projectId
    );
    if (!existingProject)
      return next(createHttpError(400, "Project not found"));

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const updatedProject = await this.projectService.updateProject(
      project,
      projectId
    );

    return res.json({ message: { project: updatedProject } });
  }

  async deleteProject(
    req: CustomRequest<{ objectId: string }>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { objectId: projectId } = req.body;
    const userId = req.userId as string;

    console.log(projectId, userId);

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    await this.projectService.deleteProject(projectId, userId);
    return res.json({ message: { deletedProject: projectId } });
  }
}

export default ProjectController;
