import mongoose, { PipelineStage } from "mongoose";
import { IssueModel } from "../model";

class IssueService {
  constructor(private issueModel: typeof IssueModel) {}

  async findIssueById(issueId: string, userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(issueId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $addFields: {
          isAuthor: {
            $eq: ["$author._id", new mongoose.Types.ObjectId(userId)],
          },
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          updatedAt: 1,
          labels: 1,
          status: 1,
          priority: 1,
          projectId: 1,
          closedIssueDate: 1,
          author: {
            _id: 1,
            fullName: 1,
            email: 1,
          },
          isAuthor: 1,
          commentCount: 1,
          description: 1,
          createdAt: 1,
        },
      },
    ];
    const result = await this.issueModel.aggregate(pipeline).exec();
    if (result.length) return result[0];
    return null;
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
