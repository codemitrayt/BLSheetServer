import { Model, model, Schema } from "mongoose";
import { CustomModel, Project } from "../types";

const projectSchema = new Schema<CustomModel<Project>>(
  {
    name: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: {
      type: [String],
      required: true,
    },
  },

  { timestamps: true }
);

const ProjectModel: Model<CustomModel<Project>> = model<CustomModel<Project>>(
  "Project",
  projectSchema
);

export default ProjectModel;
