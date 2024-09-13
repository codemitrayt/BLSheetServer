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
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },

  { timestamps: true }
);

const ProjectMemberModel: Model<CustomModel<ProjectMember>> = model<
  CustomModel<ProjectMember>
>("ProjectMember", projectMemberSchema);

export default ProjectMemberModel;
