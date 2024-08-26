import express, { NextFunction, Request, Response } from "express";

import asyncFnHandler from "../utils/async-fn-handler";
import BLSheetController from "../controllers/bl-sheet-controller";
import BLSheetService from "../services/bl-sheet-service";
import BLSheetModel from "../model/bl-sheet-model";
import authenticateJWT from "../middleware/autenticate-jwt";
import AuthService from "../services/auth-service";
import UserModel from "../model/user-model";
import validators from "../validator";

const blSheetRoute = express.Router();
const blSheetService = new BLSheetService(BLSheetModel);
const authService = new AuthService(UserModel);
const blSheetController = new BLSheetController(blSheetService, authService);

blSheetRoute.post(
  "/createBLSheet",
  validators.createBlSheetBodyValidator,
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.createBLSheet(req, res, next)
  )
);

blSheetRoute.get(
  "/getBLSheets",
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.getBLSheets(req, res, next)
  )
);

blSheetRoute.delete(
  "/deleteBLSheet",
  validators.deleteBlSheetBodyValidator,
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.deleteBLSheet(req, res, next)
  )
);

export default blSheetRoute;
