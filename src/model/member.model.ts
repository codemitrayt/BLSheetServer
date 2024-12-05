import { model, Model, Schema } from "mongoose";
import { CustomModel, ProjectMember } from "../types";

const projectMemberSchema = new Schema<CustomModel<ProjectMember>>(
  {
    memberEmailId: {
      type: String,
      require: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      required: true,
    },

    role: {
      type: String,
      enum: ["admin", "member", "owner"],
      default: "member",
    },
  },

  { timestamps: true }
);

const ProjectMemberModel: Model<CustomModel<ProjectMember>> = model<
  CustomModel<ProjectMember>
>("ProjectMember", projectMemberSchema);

export default ProjectMemberModel;
