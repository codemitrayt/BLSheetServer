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
              input: "$membersDetails", // Loop through membersDetails array
              as: "member",
              in: {
                _id: "$$member._id",
                memberEmailId: "$$member.memberEmailId",
              },
            },
          },
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
}

export default ProjectTaskService;
