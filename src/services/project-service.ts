import { ObjectId } from "mongoose";
import { ProjectModel } from "../model";
import { Project } from "../types";

class ProjectService {
  constructor(private projectModel: typeof ProjectModel) {}

  async getProjectList(userId: string) {
    return this.projectModel.find({ userId });
  }

  async createProject(project: Project) {
    return this.projectModel.create(project);
  }
}

export default ProjectService;
