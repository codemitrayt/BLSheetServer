import mongoose, { PipelineStage } from "mongoose";
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

  async getProjectListFromUserProjectArray(userId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "Project",
          localField: "projects",
          foreignField: "_id",
          as: "projects",
        },
      },
      {
        $addFields: {
          isAdmin: { $eq: ["$userId", userId] },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          img: 1,
          tags: 1,
          isAdmin: 1,
        },
      },
    ];
    const results = await this.projectModel.aggregate(pipeline).exec();
    if (results.length > 0) return results;
    return [];
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
