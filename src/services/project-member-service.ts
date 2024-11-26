import mongoose, { PipelineStage } from "mongoose";
import { ProjectMemberModel } from "../model";
import { GetProjectMemberQuery, ProjectMember } from "../types";

class ProjectMemberService {
  constructor(private projectMemberModel: typeof ProjectMemberModel) {}

  async getProjectMemberById(memberId: string) {
    return await this.projectMemberModel.findById(memberId);
  }

  async getProjectMembers(
    projectId: string,
    userId: string,
    query: GetProjectMemberQuery
  ) {
    const { currentPage, perPage, memberEmail, status } = query;
    const searchQuery = new RegExp(memberEmail, "i");

    const pipeline: PipelineStage[] = [
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          memberEmailId: { $regex: searchQuery },
          ...(status && { status }),
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
      { $unwind: "$user" },
      {
        $addFields: {
          isAdmin: { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
        },
      },
      {
        $project: {
          _id: 1,
          memberEmailId: 1,
          user: {
            fullName: 1,
          },
          status: 1,
          isAdmin: 1,
          role: 1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          projectMembers: [
            { $skip: (currentPage - 1) * perPage },
            { $limit: perPage },
          ],
        },
      },
      {
        $unwind: "$metadata",
      },
      {
        $addFields: {
          totalCount: "$metadata.totalCount",
        },
      },
    ];

    const result = await this.projectMemberModel.aggregate(pipeline).exec();
    if (result.length) return result[0];
    return { metadata: { totalCount: 0 }, projectMembers: [] };
  }

  async addProjectMember(projectMember: ProjectMember) {
    return await this.projectMemberModel.create(projectMember);
  }

  async getProjectMember(projectId: string, email: string) {
    return await this.projectMemberModel.findOne({
      projectId,
      memberEmailId: email,
    });
  }

  async updateProjectMember(
    projectMemberId: string,
    projectMember: ProjectMember
  ) {
    return await this.projectMemberModel.findByIdAndUpdate(
      projectMemberId,
      projectMember,
      {
        new: true,
      }
    );
  }

  async findMemberByUserIdAndProjectId(userId: string, projectId: string) {
    return await this.projectMemberModel.findOne({
      userId,
      projectId,
    });
  }

  async deleteProjectMember(memberId: string) {
    return await this.projectMemberModel.deleteOne({ _id: memberId });
  }

  async getProjectMemberByEmailIdAndProjectId(
    email: string,
    projectId: string
  ) {
    return await this.projectMemberModel.findOne({
      memberEmailId: email,
      projectId,
    });
  }

  async getProjectsWithRole(userId: string) {
    const aggregationPipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $lookup: {
          from: "users",
          localField: "project.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $addFields: {
          memberId: "$_id",
          _id: "$project._id",
          name: "$project.name",
          description: "$project.description",
          tags: "$project.tags",
          img: "$project.img",
          userId: "$user.userId",
        },
      },
      {
        $project: {
          role: 1,
          memberId: 1,
          name: 1,
          description: 1,
          tags: 1,
          img: 1,
          userId: 1,
          user: {
            _id: 1,
            fullName: 1,
            email: 1,
          },
        },
      },
    ];

    const result = await this.projectMemberModel
      .aggregate(aggregationPipeline)
      .exec();
    return result;
  }

  async getProjectByMemberId(memberId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { _id: new mongoose.Types.ObjectId(memberId) } },
      {
        $lookup: {
          from: "projects",
          localField: "projectId",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
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
        $addFields: {
          memberId: "$_id",
        },
      },
      {
        $project: {
          _id: 0,
          userId: 0,
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
          "project._id": 0,
          "project.labels": 0,
          "project.createdAt": 0,
          "project.updatedAt": 0,
          "project.__v": 0,
          "user._id": 0,
          "user.role": 0,
          "user.password": 0,
          "user.createdAt": 0,
          "user.updatedAt": 0,
          "user.__v": 0,
          "user.projects": 0,
          memberEmailId: 0,
        },
      },
    ];

    const result = await this.projectMemberModel.aggregate(pipeline).exec();
    if (result.length > 0) {
      return result[0];
    }
    return null;
  }
}

export default ProjectMemberService;
