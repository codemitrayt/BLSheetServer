import mongoose, { ObjectId, PipelineStage } from "mongoose";
import { ProjectModel, UserModel } from "../model";
import { Project } from "../types";

class ProjectService {
  constructor(
    private projectModel: typeof ProjectModel,
    private userModel: typeof UserModel
  ) {}

  async getProject(projectId: string, userId: string) {
    return this.projectModel.findOne({ _id: projectId, userId });
  }

  async getProjectById(projectId: string) {
    return this.projectModel.findById(projectId);
  }

  async getProjectList(userId: string) {
    return this.projectModel.find({ userId });
  }

  async getProjectListFromUserProjectArray(projects: ObjectId[]) {
    return await this.projectModel.find({ _id: { $in: projects } });
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
