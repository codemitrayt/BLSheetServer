import BLSheetModel from "../model/bl-sheet-model";
import { BLSheet } from "../types";

class BLSheetService {
  constructor(private blSheetModel: typeof BLSheetModel) {}

  async findBLSheetsByUserId(userId: string) {
    return await this.blSheetModel.find({ userId });
  }

  async createBLSheet(blSheet: BLSheet) {
    return await this.blSheetModel.create(blSheet);
  }

  async getBLSheetById(blSheetId: string) {
    return await this.blSheetModel.findById(blSheetId).populate("userId");
  }

  async updateBLSheet(blSheetId: string, blSheet: BLSheet) {
    return await this.blSheetModel
      .findByIdAndUpdate(blSheetId, blSheet, {
        new: true,
      })
      .populate("userId");
  }
}

export default BLSheetService;
