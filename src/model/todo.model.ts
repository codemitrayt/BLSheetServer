import { Model, model, Schema } from "mongoose";
import { CustomModel, Todo } from "../types";

const todoSchema = new Schema<CustomModel<Todo>>(
  {
    title: {
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

    status: {
      type: String,
      enum: ["completed", "in_progress", "pending"],
      required: true,
    },

    level: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
  },

  { timestamps: true }
);

const TodoModel: Model<CustomModel<Todo>> = model<CustomModel<Todo>>(
  "Todo",
  todoSchema
);

export default TodoModel;
