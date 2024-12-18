import { Model, model, Schema } from "mongoose";
import { CustomModel, User } from "../types";

const userShecma = new Schema<CustomModel<User>>(
  {
    fullName: {
      type: String,
      require: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    role: {
      type: String,
      enum: ["admin", "customer", "guest"],
      default: "customer",
    },

    password: {
      type: String,
      required: true,
    },

    pricingModel: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      default: "free",
    },

    avatar: {
      type: {
        url: String,
        assetId: String,
      },
      required: false,
    },
  },

  { timestamps: true }
);

const UserModel: Model<CustomModel<User>> = model<CustomModel<User>>(
  "User",
  userShecma
);

export default UserModel;
