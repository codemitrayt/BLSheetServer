import { CommentModel } from "../model";
import { Comment } from "../types";

class CommentService {
  constructor(private commentModel: typeof CommentModel) {}

  async createComment(comment: Comment) {
    return await this.commentModel.create(comment);
  }

  async getCommentById(commentId: string) {
    return await this.commentModel.findById(commentId);
  }

  async updateComment(commentId: string, comment: Comment) {
    return await this.commentModel.findByIdAndUpdate(commentId, comment, {
      new: true,
    });
  }

  async deleteComment(commentId: string) {
    return await this.commentModel.deleteOne({ _id: commentId });
  }
}

export default CommentService;
