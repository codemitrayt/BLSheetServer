import { ProjectMemberModel } from "../model";
import { ProjectMember } from "../types";

class ProjectMemberService {
  constructor(private projectMemberModel: typeof ProjectMemberModel) {}

  async getProjectMemberById(memberId: string) {
    return await this.projectMemberModel.findById(memberId);
  }

  async getProjectMembers(projectId: string) {
    return await this.projectMemberModel.find({ projectId });
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
}

export default ProjectMemberService;
