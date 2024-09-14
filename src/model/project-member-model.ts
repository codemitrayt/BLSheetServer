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
  },

  { timestamps: true }
);

const ProjectMemberModel: Model<CustomModel<ProjectMember>> = model<
  CustomModel<ProjectMember>
>("ProjectMember", projectMemberSchema);

export default ProjectMemberModel;
