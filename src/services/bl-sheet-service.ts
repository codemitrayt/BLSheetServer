import BLSheetModel from "../model/bl-sheet-model";
import { BLSheet } from "../types";

class BLSheetService {
  constructor(private blSheetModel: typeof BLSheetModel) {}

  async findBLSheetsByUserId(userId: string) {
    return await this.blSheetModel.find({ userId }).sort({ date: -1 });
  }

  async createBLSheet(blSheet: BLSheet) {
    return await this.blSheetModel.create(blSheet);
  }

  async getBLSheetById(blSheetId: string) {
    return await this.blSheetModel.findById(blSheetId).populate("userId");
  }

  async updateBLSheet(blSheetId: string, blSheet: BLSheet) {
    return await this.blSheetModel.findByIdAndUpdate(blSheetId, blSheet, {
      new: true,
    });
  }

  async deleteBLSheet(blSheetId: string, userId: string) {
    return await this.blSheetModel.deleteOne({
      _id: blSheetId,
      userId,
    });
  }

  async fingBySheetIdAndUserId(blSheetId: string, userId: string) {
    return await this.blSheetModel.findOne({ _id: blSheetId, userId });
  }
}

export default BLSheetService;
