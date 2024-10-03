import mongoose, { ObjectId, PipelineStage } from "mongoose";
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

  async updateComment(commentId: string, comment: { content: string }) {
    return await this.commentModel.findByIdAndUpdate(commentId, comment, {
      new: true,
    });
  }

  async deleteComment(commentId: string) {
    return await this.commentModel.deleteOne({ _id: commentId });
  }

  async replyToComment(commentId: string, replyCommentId: ObjectId) {
    return await this.commentModel.findByIdAndUpdate(
      commentId,
      { $push: { replies: replyCommentId } },
      { new: true }
    );
  }

  async getReplies(commentId: string, userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(commentId),
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "replies",
          foreignField: "_id",
          as: "commentsDetails",
        },
      },
      {
        $unwind: "$commentsDetails",
      },
      {
        $lookup: {
          from: "users",
          localField: "commentsDetails.userId",
          foreignField: "_id",
          as: "commentsDetails.author",
        },
      },
      {
        $unwind: "$commentsDetails.author",
      },
      {
        $addFields: {
          "commentsDetails.isCreator": {
            $cond: {
              if: {
                $eq: [{ $toString: "$commentsDetails.author._id" }, userId],
              },
              then: true,
              else: false,
            },
          },
          "commentsDetails.replyCount": { $size: "$commentsDetails.replies" },
        },
      },
      {
        $project: {
          "commentsDetails.userId": 0,
          "commentsDetails.__v": 0,
          "commentsDetails.author.password": 0,
          "commentsDetails.author.projects": 0,
          "commentsDetails.author.__v": 0,
          "commentsDetails.author.createdAt": 0,
          "commentsDetails.author.updatedAt": 0,
          "commentsDetails.author.role": 0,
          "commentsDetails.replies": 0,
        },
      },
      {
        $group: {
          _id: "$_id",
          replies: { $push: "$commentsDetails" },
        },
      },
      {
        $project: {
          createdAt: 0,
          updatedAt: 0,
          __v: 0,
        },
      },
    ];

    const result = await this.commentModel.aggregate(pipeline).exec();
    if (result.length) return result[0];
    return [];
  }
}

export default CommentService;
