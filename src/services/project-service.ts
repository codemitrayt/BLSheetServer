import mongoose, { mongo, ObjectId } from "mongoose";
import { ProjectModel } from "../model";
import { Project } from "../types";

class ProjectService {
  constructor(private projectModel: typeof ProjectModel) {}

  async getProject(projectId: string, userId: string) {
    return this.projectModel.findOne({ _id: projectId, userId });
  }

  async findProjectById(projectId: string) {
    return this.projectModel.findById(projectId);
  }

  async getProjectById(projectId: string, userId: string) {
    const result = await this.projectModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(projectId) },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          name: 1,
          userId: 1,
          description: 1,
          tags: 1,
          img: 1,
          user: {
            _id: "$user._id",
            fullName: "$user.fullName",
            email: "$user.email",
          },
        },
      },
      {
        $addFields: {
          isAdmin: { $eq: ["$user._id", new mongoose.Types.ObjectId(userId)] },
        },
      },
    ]);

    if (result.length) return result[0];
    return null;
  }

  async getProjectList(userId: string) {
    return this.projectModel.find({ userId });
  }

  async getProjectListFromUserProjectArray(
    projects: ObjectId[],
    userId: string
  ) {
    return await this.projectModel.aggregate([
      {
        $match: {
          _id: { $in: projects },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          userId: 1,
          tags: 1,
          img: 1,
          user: {
            _id: "$user._id",
            fullName: "$user.fullName",
            email: "$user.email",
          },
        },
      },
      {
        $addFields: {
          isAdmin: { $eq: ["$user._id", new mongoose.Types.ObjectId(userId)] },
        },
      },
    ]);
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
