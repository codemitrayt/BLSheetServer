import { Model, model, Schema } from "mongoose";
import { BLSheet, CustomModel } from "../types";

const blSheetSchema = new Schema<CustomModel<BLSheet>>(
  {
    clientName: {
      type: String,
      require: true,
    },

    description: {
      type: String,
      required: true,
    },

    money: {
      type: Number,
      required: true,
    },

    isPaid: {
      type: Boolean,
      required: true,
    },

    tax: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  { timestamps: true }
);

const BLSheetModel: Model<CustomModel<BLSheet>> = model<CustomModel<BLSheet>>(
  "BLSheet",
  blSheetSchema
);

export default BLSheetModel;
