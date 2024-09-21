import { Model, model, Schema } from "mongoose";
import { Comment, CustomModel } from "../types";

const commentSchema = new Schema<CustomModel<Comment>>(
  {
    content: { type: String, return: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: { type: Number, default: 0 },
    replies: [{ type: Schema.Types.ObjectId, ref: "comment" }],
  },
  { timestamps: true }
);

const CommentModel: Model<CustomModel<Comment>> = model<CustomModel<Comment>>(
  "Comment",
  commentSchema
);

export default CommentModel;
