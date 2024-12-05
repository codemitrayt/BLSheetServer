import mongoose, { PipelineStage } from "mongoose";

import { UserModel } from "../model";
import { User } from "../types";

class AuthService {
  constructor(private userModel: typeof UserModel) {}

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async createUser(user: User) {
    return await this.userModel.create(user);
  }

  async findByUserId(userId: string) {
    return await this.userModel.findById(userId);
  }

  async findUserById(userId: string) {
    const pipeline: PipelineStage[] = [
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          fullName: 1,
          email: 1,
          role: 1,
          _id: 1,
        },
      },
    ];
    const user = await this.userModel.aggregate(pipeline).exec();
    if (!user.length) return null;
    return user[0];
  }

  async updateUserPassword(userId: string, password: string) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { password },
      {
        new: true,
      }
    );
  }

  async addProject(userId: string, projectId: string) {
    return await this.userModel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $push: { projects: new mongoose.Types.ObjectId(projectId) } },
      { new: true }
    );
  }

  async updateUserProfilePicture(
    userId: string,
    avatar: { url: string; assetId: string }
  ) {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );
  }

  async removeProject(userId: string, projectId: string) {
    const result = await this.userModel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $pull: { projects: new mongoose.Types.ObjectId(projectId) } },
      { new: true }
    );
    return result;
  }

  async updateUser(userId: string, user: { fullName?: string }) {
    return await this.userModel.findByIdAndUpdate(userId, user, { new: true });
  }
}

export default AuthService;
