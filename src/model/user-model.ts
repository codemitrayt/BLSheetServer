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

    // projects: {
    //   type: [Schema.Types.ObjectId],
    //   ref: "Project",
    //   required: false,
    // },
  },

  { timestamps: true }
);

const UserModel: Model<CustomModel<User>> = model<CustomModel<User>>(
  "User",
  userShecma
);

export default UserModel;
