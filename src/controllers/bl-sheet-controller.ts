import { ObjectId } from "mongoose";
import { Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";

import BLSheetService from "../services/bl-sheet-service";
import { BLSheet, CustomRequest, DeleteBLSheetBody } from "../types";
import AuthService from "../services/auth-service";

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

    const blSheets = await this.blSheetService.findBLSheetsByUserId(userId);
    return res.json({ message: { blSheets } });
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
}

export default BLSheetController;
