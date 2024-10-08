import { model, Model, Schema } from "mongoose";
import {
  CustomModel,
  Issue,
  IssuePriority,
  IssueStatus,
  ProjectMember,
} from "../types";

const issueModel = new Schema<CustomModel<Issue>>(
  {
    title: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: IssueStatus.OPEN,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: IssuePriority.LOW,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    closedIssueDate: {
      type: Date,
      default: null,
    },

    labels: {
      type: [String],
      default: [],
    },

    assignees: {
      type: [Schema.Types.ObjectId],
      ref: "PrjectMember",
    },
  },

  { timestamps: true }
);

const IssueModel: Model<CustomModel<Issue>> = model<CustomModel<Issue>>(
  "Issue",
  issueModel
);

export default IssueModel;
