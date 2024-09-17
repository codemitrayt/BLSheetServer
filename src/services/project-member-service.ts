import mongoose, { PipelineStage } from "mongoose";
import { ProjectMemberModel } from "../model";
import { ProjectMember } from "../types";

class ProjectMemberService {
  constructor(private projectMemberModel: typeof ProjectMemberModel) {}

  async getProjectMemberById(memberId: string) {
    return await this.projectMemberModel.findById(memberId);
  }

  async getProjectMembers(projectId: string, userId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      {
        $addFields: {
          isAdmin: { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
        },
      },
      {
        $project: {
          _id: 1,
          memberEmailId: 1,
          status: 1,
          isAdmin: 1,
        },
      },
    ];

    const result = await this.projectMemberModel.aggregate(pipeline).exec();
    return result;
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
}

export default ProjectMemberService;
