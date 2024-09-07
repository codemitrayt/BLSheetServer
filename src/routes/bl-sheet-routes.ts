import express, {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from "express";

import asyncFnHandler from "../utils/async-fn-handler";
import validators from "../validator";
import { authenticateJwt } from "../middleware";
import { BLSheetController } from "../controllers";
import { BLSheetModel, UserModel } from "../model";
import { BLSheetService, AuthService } from "../services";

const blSheetRoute = express.Router();
const blSheetService = new BLSheetService(BLSheetModel);
const authService = new AuthService(UserModel);
const blSheetController = new BLSheetController(blSheetService, authService);

blSheetRoute.post(
  "/createBLSheet",
  validators.createBlSheetBodyValidator,
  authenticateJwt,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.createBLSheet(req, res, next)
  )
);

blSheetRoute.get(
  "/getBLSheets",
  validators.getBLSheetsQueryValidator,
  authenticateJwt,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.getBLSheets(req, res, next)
  )
);

blSheetRoute.delete(
  "/deleteBLSheet",
  validators.deleteBlSheetBodyValidator,
  authenticateJwt,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.deleteBLSheet(req, res, next)
  )
);

blSheetRoute.put(
  "/editBLSheet",
  [
    validators.createBlSheetBodyValidator as unknown as RequestHandler,
    validators.editBlSheetQueryValidator as unknown as RequestHandler,
    authenticateJwt,
  ],
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.editBLSheet(req, res, next)
  )
);

blSheetRoute.get(
  "/totalMoneyDistributedAnalytics",
  authenticateJwt,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.totalMoneyDistributedAnalytics(req, res, next)
  )
);

blSheetRoute.get(
  "/dailyAnalytics",
  authenticateJwt,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    blSheetController.dailyAnalytics(req, res, next)
  )
);

export default blSheetRoute;
