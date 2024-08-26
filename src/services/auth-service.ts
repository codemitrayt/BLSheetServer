import UserModel from "../model/user-model";
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
}

export default AuthService;
