import { CommentModel } from "../model";
import { Comment } from "../types";

class CommentService {
  constructor(private commentModel: typeof CommentModel) {}

  async createComment(comment: Comment) {
    return await this.commentModel.create(comment);
  }
}

export default CommentService;
