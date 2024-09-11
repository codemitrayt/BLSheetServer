import { ObjectId } from "mongoose";
import { ProjectModel } from "../model";
import { Project } from "../types";

class ProjectService {
  constructor(private projectModel: typeof ProjectModel) {}

  async getProject(projectId: string, userId: string) {
    return this.projectModel.findOne({ _id: projectId, userId });
  }

  async getProjectList(userId: string) {
    return this.projectModel.find({ userId });
  }

  async createProject(project: Project) {
    return this.projectModel.create(project);
  }

  async deleteProject(objectId: string, userId: string) {
    return await this.projectModel.deleteOne({ _id: objectId, userId });
  }

  async findBySheetIdAndUserId(objectId: string) {
    return await this.projectModel.findById(objectId);
  }

  async updateProject(project: Project, projectId: string) {
    return await this.projectModel.findByIdAndUpdate(
      projectId,
      { $set: project },
      { new: true }
    );
  }
}

export default ProjectService;
