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
}

export default AuthService;
