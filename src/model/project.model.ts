import { Model, model, Schema } from "mongoose";
import { CustomModel, Project } from "../types";
import Config from "../config";

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

    img: {
      type: String,
      required: false,
      default: `${Config.BACKEND_URL}/project-img.jpg`,
    },

    labels: {
      type: [Schema.Types.ObjectId],
      ref: "Label",
      required: false,
    },
  },

  { timestamps: true }
);

const ProjectModel: Model<CustomModel<Project>> = model<CustomModel<Project>>(
  "Project",
  projectSchema
);

export default ProjectModel;
