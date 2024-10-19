import mongoose, { PipelineStage } from "mongoose";
import { IssueModel } from "../model";
import { GetIssuesQuery, IssueStatus } from "../types";

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
        $lookup: {
          from: "users",
          localField: "closedBy",
          foreignField: "_id",
          as: "closedBy",
        },
      },
      {
        $unwind: {
          path: "$closedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
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
          closedBy: 1,
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

  async issueCounts(projectId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(projectId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ];
    const result = await this.issueModel.aggregate(pipeline).exec();
    const statusCounts = result.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    if (Object.keys(statusCounts).length) return statusCounts;
    return { open: 0, closed: 0 };
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
          from: "users",
          localField: "closedBy",
          foreignField: "_id",
          as: "closedBy",
        },
      },
      {
        $unwind: {
          path: "$closedBy",
          preserveNullAndEmptyArrays: true,
        },
      },
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
          closedBy: 1,
          author: 1,
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

  async changeStatusIssue(
    issueId: string,
    status: IssueStatus,
    userId: string
  ) {
    return await this.issueModel.findByIdAndUpdate(issueId, {
      status,
      closedBy: new mongoose.Types.ObjectId(userId),
      closedIssueDate: new Date(),
    });
  }

  async getAllIssues() {
    return await this.issueModel.find();
  }
}

export default IssueService;
