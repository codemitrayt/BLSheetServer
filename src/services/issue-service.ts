import mongoose, { PipelineStage } from "mongoose";
import { IssueModel } from "../model";
import { GetIssuesQuery } from "../types";

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

  async findIssuesByProjectId(
    projectId: string,
    userId: string,
    memberId: string,
    query: GetIssuesQuery
  ) {
    let searchQuery = new RegExp(query.search, "i");
    const pipeline: PipelineStage[] = [
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
          ...(query?.isCreatedByMe && {
            userId: new mongoose.Types.ObjectId(userId),
          }),
          ...(!!query?.status && { status: query.status }),
          ...(!!query?.priority && { priority: query.priority }),
          ...(query.labels.length && { labels: { $in: query.labels } }),
          ...(query?.isAssignedToMe && { assignedTo: { $in: [userId] } }),
          title: { $regex: searchQuery },
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
        $lookup: {
          from: "projectmembers",
          localField: "assignees",
          foreignField: "_id",
          as: "membersDetails",
        },
      },
      {
        $addFields: {
          assignedMembers: {
            $map: {
              input: "$membersDetails",
              as: "member",
              in: {
                _id: "$$member._id",
                memberEmailId: "$$member.memberEmailId",
              },
            },
          },
          commentCount: { $size: "$comments" },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          labels: 1,
          status: 1,
          priority: 1,
          userId: 1,
          closedIssueDate: 1,
          attachments: 1,
          assignedMembers: 1,
          commentCount: 1,
          createdAt: 1,
          author: {
            _id: "$author._id",
            fullName: "$author.fullName",
            email: "$author.email",
          },
        },
      },
      { $sort: { createdAt: query?.isSort ? 1 : -1 } },
      {
        $addFields: {
          isAuthor: { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
          isAssignee: {
            $in: [
              new mongoose.Types.ObjectId(memberId),
              "$assignedMembers._id",
            ],
          },
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          issues: [
            { $skip: (query.currentPage - 1) * query.perPage },
            { $limit: query.perPage },
          ],
        },
      },
      {
        $unwind: "$metadata",
      },
    ];
    const result = await this.issueModel.aggregate(pipeline).exec();
    if (result.length) return result[0];
    return { metadata: { totalCount: 0 }, issues: [] };
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
