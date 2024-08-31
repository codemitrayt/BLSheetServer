import { ObjectId } from "mongoose";
import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

import { AuthService, BLSheetService } from "../services";
import {
  BLSheet,
  CustomRequest,
  DeleteBLSheetBody,
  GetBLSheetQueryParams,
} from "../types";

class BLSheetController {
  constructor(
    private blSheetService: BLSheetService,
    private authService: AuthService
  ) {}

  async createBLSheet(
    req: CustomRequest<BLSheet>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const blSheet = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const newBlSheet = await this.blSheetService.createBLSheet({
      ...blSheet,
      userId: userId as unknown as ObjectId,
    });
    return res.json({ message: { blSheet: newBlSheet } });
  }

  async getBLSheets(req: CustomRequest, res: Response, next: NextFunction) {
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const blSheets = await this.blSheetService.findBLSheetsByUserId(
      userId,
      req.query as unknown as GetBLSheetQueryParams
    );
    return res.json({ message: blSheets });
  }

  async deleteBLSheet(
    req: CustomRequest<DeleteBLSheetBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { objectId: blSheetId } = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    await this.blSheetService.deleteBLSheet(blSheetId, userId);
    return res.json({ message: { deletedBlSheetId: blSheetId } });
  }

  async editBLSheet(
    req: CustomRequest<BLSheet>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const blSheet = req.body;
    const userId = req.userId as string;
    const blSheetId = req.query.objectId as string;

    const existingBlSheet = await this.blSheetService.fingBySheetIdAndUserId(
      blSheetId,
      userId
    );
    if (!existingBlSheet)
      return next(createHttpError(400, "Bl sheet not found"));

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const updatedBlSheet = await this.blSheetService.updateBLSheet(
      blSheetId,
      blSheet
    );

    return res.json({ message: { blSheet: updatedBlSheet } });
  }

  async totalMoneyDistributedAnalytics(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) {
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const matrics = await this.blSheetService.totalMoneyDistributedAnalytics(
      userId
    );

    return res.json({ message: { matrics } });
  }
}

export default BLSheetController;
