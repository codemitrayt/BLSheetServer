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
}

export default ProjectMemberService;
