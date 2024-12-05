import mongoose, { PipelineStage } from "mongoose";

import { BLSheetModel } from "../model";
import { BLSheet, BLSheetFilters, GetBLSheetQueryParams } from "../types";

class BLSheetService {
  constructor(private blSheetModel: typeof BLSheetModel) {}

  async findBLSheetsByUserId(userId: string, query: GetBLSheetQueryParams) {
    const { search, type, currentPage, perPage, startDate, endDate } = query;
    const searchQuery = new RegExp(search, "i");

    const filters: BLSheetFilters = {};
    if (type) filters.type = type;

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...filters,
          clientName: { $regex: searchQuery },
          ...(startDate &&
            endDate && { date: { $gte: startDate, $lt: endDate } }),
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "totalCount" }],
          blSheets: [
            { $skip: (currentPage - 1) * perPage },
            { $limit: perPage },
          ],
        },
      },
      {
        $unwind: "$metadata",
      },
      {
        $addFields: {
          totalMoney: { $sum: "$blSheets.totalMoney" },
          totalCount: "$metadata.totalCount",
        },
      },
    ];

    const result = await this.blSheetModel.aggregate(pipeline).exec();
    if (result.length) return result[0];
    return { metadata: { totalCount: 0 }, blSheets: [] };
  }

  async dailyAnalytics(userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          type: 1,
          money: 1,
          tax: 1,
          totalMoney: 1,
          date: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ];

    const result = await this.blSheetModel.aggregate(pipeline).exec();
    return result;
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

  async totalMoneyDistributedAnalytics(userId: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$totalMoney",
          },
        },
      },
      {
        $addFields: {
          type: "$_id",
        },
      },
      {
        $sort: {
          type: -1,
        },
      },
      {
        $project: {
          type: 1,
          total: 1,
          _id: 0,
        },
      },
    ];
    return await this.blSheetModel.aggregate(pipeline).exec();
  }
}

export default BLSheetService;
