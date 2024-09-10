import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { AuthService, ProjectService } from "../services";
import { CustomRequest, Project } from "../types";
import { ObjectId } from "mongoose";

class ProjectController {
  constructor(
    private projectService: ProjectService,
    private authService: AuthService
  ) {}

  getProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Get Project" });
  }

  getProjectList(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Get Project List" });
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

  updateProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Update Project" });
  }

  deleteProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Delete Project" });
  }
}

export default ProjectController;
