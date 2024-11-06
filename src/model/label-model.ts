import { model, Model, Schema } from "mongoose";
import { CustomModel, Label } from "../types";

const labelModel = new Schema<CustomModel<Label>>(
  {
    name: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      required: true,
    },

    isDelete: {
      type: Boolean,
      default: false,
    },

    color: {
      type: String,
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
    },
  },

  { timestamps: true }
);

const LabelModel: Model<CustomModel<Label>> = model<CustomModel<Label>>(
  "Label",
  labelModel
);

export default LabelModel;
