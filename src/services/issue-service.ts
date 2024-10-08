import { IssueModel } from "../model";

class IssueService {
  constructor(private issueModel: typeof IssueModel) {}

  async findIssueById(issueId: string) {
    return await this.issueModel.findById(issueId);
  }

  async findIssuesByProjectId(projectId: string) {
    return await this.issueModel.find({ projectId });
  }

  async getIssueById(issueId: string) {
    return await this.issueModel.findById(issueId);
  }

  async createIssue(issue: any) {
    return await this.issueModel.create(issue);
  }

  async updateIssue(issueId: string, issue: any) {
    return await this.issueModel.findByIdAndUpdate(issueId, issue, {
      new: true,
    });
  }

  async deleteIssue(issueId: string) {
    return await this.issueModel.deleteOne({ _id: issueId });
  }

  async getAllIssues() {
    return await this.issueModel.find();
  }
}

export default IssueService;
