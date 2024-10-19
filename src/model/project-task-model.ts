import mongoose, { model, Model } from "mongoose";
import { CustomModel, ProjectTask } from "../types";

const projectTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "under_review", "completed"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    tags: {
      type: [String],
      required: true,
    },
    assignedTo: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ProjectMember",
      required: false,
    },
    completedDate: {
      type: Date,
      default: null,
      required: false,
    },
    attachments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Attachment",
      required: false,
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
      required: false,
    },
    subtasks: {
      type: Array,
      required: false,
    },
  },
  { timestamps: true }
);

const ProjectTaskModel: Model<CustomModel<ProjectTask>> = model<
  CustomModel<ProjectTask>
>("ProjectTask", projectTaskSchema);

export default ProjectTaskModel;
