import { NextFunction, Request, Response } from "express";

class ProjectController {
  getProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Get Project" });
  }

  getProjectList(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Get Project List" });
  }

  createProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Create Project" });
  }

  updateProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Update Project" });
  }

  deleteProject(req: Request, res: Response, next: NextFunction) {
    return res.json({ message: "Delete Project" });
  }
}

export default ProjectController;
