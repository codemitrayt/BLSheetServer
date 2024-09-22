import mongoose, { PipelineStage } from "mongoose";
import { ProjectTaskModel } from "../model";
import { ProjectTask } from "../types";

class ProjectTaskService {
  constructor(private projectTaskModel: typeof ProjectTaskModel) {}

  async getProjectTasksByProjectId(projectId: string, userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: { projectId: new mongoose.Types.ObjectId(projectId) },
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
        $lookup: {
          from: "projectmembers",
          localField: "assignedTo",
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
          startDate: 1,
          endDate: 1,
          tags: 1,
          status: 1,
          priority: 1,
          userId: 1,
          projectId: 1,
          completedDate: 1,
          attachments: 1,
          assignedMembers: 1,
          commentCount: 1,
          user: {
            _id: "$user._id",
            fullName: "$user.fullName",
            email: "$user.email",
          },
        },
      },
      {
        $addFields: {
          isCreator: { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
        },
      },
    ];
    const result = await this.projectTaskModel.aggregate(pipeline).exec();
    return result;
  }

  async getProjectTaskById(taskId: string) {
    return await this.projectTaskModel.findById(taskId);
  }

  async createProjectTask(projectTask: ProjectTask) {
    return await this.projectTaskModel.create(projectTask);
  }

  async updateProjectTask(taskId: string, projectTask: ProjectTask) {
    return await this.projectTaskModel.findByIdAndUpdate(taskId, projectTask, {
      new: true,
    });
  }

  async deleteProjectTask(taskId: string, userId: string) {
    return await this.projectTaskModel.deleteOne({ _id: taskId, userId });
  }

  async getProjectTaskByIdAndUserId(taskId: string, userId: string) {
    return await this.projectTaskModel.findOne({
      _id: taskId,
      userId,
    });
  }

  async deleteProjectTaskById(taskId: string) {
    return await this.projectTaskModel.deleteOne({ _id: taskId });
  }

  async assignMember(projectTaskId: string, memberId: string) {
    return await this.projectTaskModel.findByIdAndUpdate(
      projectTaskId,
      { $push: { assignedTo: memberId } },
      { new: true }
    );
  }

  async removeMember(projectTaskId: string, memberId: string) {
    return await this.projectTaskModel.findByIdAndUpdate(
      projectTaskId,
      { $pull: { assignedTo: new mongoose.Types.ObjectId(memberId) } },
      { new: true }
    );
  }

  async addComment(projectTaskId: string, commentId: string) {
    return await this.projectTaskModel.findByIdAndUpdate(
      projectTaskId,
      { $push: { comments: commentId } },
      { new: true }
    );
  }

  async getComments(projectTaskId: string, userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: { _id: new mongoose.Types.ObjectId(projectTaskId) },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments",
          foreignField: "_id",
          as: "commentsDetails",
        },
      },
      {
        $unwind: "$commentsDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "commentsDetails.userId",
          foreignField: "_id",
          as: "commentsDetails.author",
        },
      },
      {
        $unwind: "$commentsDetails.author",
      },
      {
        $addFields: {
          "commentsDetails.isCreator": {
            $cond: {
              if: {
                $eq: [{ $toString: "$commentsDetails.author._id" }, userId],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          "commentsDetails.userId": 0,
          "commentsDetails.__v": 0,
          "commentsDetails.author.password": 0,
          "commentsDetails.author.projects": 0,
          "commentsDetails.author.__v": 0,
          "commentsDetails.author.createdAt": 0,
          "commentsDetails.author.updatedAt": 0,
          "commentsDetails.author.role": 0,
        },
      },
      {
        $group: {
          _id: "$_id",
          comments: { $push: "$commentsDetails" },
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ];

    const result = await this.projectTaskModel.aggregate(pipeline).exec();
    if (result.length > 0) return result[0];
    return { comments: [] };
  }

  async removeComment(projectTaskId: string, commentId: string) {
    return await this.projectTaskModel.findByIdAndUpdate(
      projectTaskId,
      { $pull: { comments: new mongoose.Types.ObjectId(commentId) } },
      { new: true }
    );
  }
}

export default ProjectTaskService;
