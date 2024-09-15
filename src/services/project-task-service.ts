import { ProjectTaskModel } from "../model";
import { ProjectTask } from "../types";

class ProjectTaskService {
  constructor(private projectTaskModel: typeof ProjectTaskModel) {}

  async getProjectTasksByProjectId(projectId: string) {
    return await this.projectTaskModel.find({ projectId });
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
}

export default ProjectTaskService;
