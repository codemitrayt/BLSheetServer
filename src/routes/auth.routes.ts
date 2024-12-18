import express, { NextFunction, Request, Response } from "express";

import asyncFnHandler from "../utils/async-fn-handler";
import validators from "../validator";
import { UserModel } from "../model";
import { AuthController } from "../controllers";
import { authenticateJwt, uploader } from "../middleware";
import logger from "../config/logger";
import {
  AuthService,
  NotificationService,
  TokenService,
  HashService,
  UploadService,
} from "../services";
import {
  CreatePasswordBody,
  CustomRequest,
  EmailBody,
  LoginUserBody,
  SelfBody,
  SendVerificationEmailForRegistrationBody,
} from "../types";

const authRouter = express.Router();
const notificationService = new NotificationService();
const authService = new AuthService(UserModel);
const tokenService = new TokenService();
const hashService = new HashService();
const uploadService = new UploadService();
const authController = new AuthController(
  authService,
  notificationService,
  tokenService,
  hashService,
  uploadService,
  logger
);

authRouter.post(
  "/sendVerificationEmailForRegistration",
  validators.sendVerificationEmailForRegistrationBodyValidator,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.sendVerificationEmailForRegistration(
      req as CustomRequest<SendVerificationEmailForRegistrationBody>,
      res,
      next
    )
  )
);

authRouter.post(
  "/createPassword",
  validators.createPasswordBodyValidator,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.createPassword(
      req as CustomRequest<CreatePasswordBody>,
      res,
      next
    )
  )
);

authRouter.post(
  "/login",
  validators.loginUserBodyValidator,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.login(req as CustomRequest<LoginUserBody>, res, next)
  )
);

authRouter.post(
  "/self",
  validators.selfBodyValidator,
  authenticateJwt,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.self(req as CustomRequest<SelfBody>, res, next)
  )
);

authRouter.post(
  "/forgotPassword",
  validators.forgotPasswordBodyValidator,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.forgotPassword(req as CustomRequest<EmailBody>, res, next)
  )
);

authRouter.post(
  "/resetPassword",
  validators.createPasswordBodyValidator,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.resetPassword(
      req as CustomRequest<CreatePasswordBody>,
      res,
      next
    )
  )
);

authRouter.post(
  "/uploadProfilePicture",
  authenticateJwt,
  uploader.single("avatar"),
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.uploadProfilePicture(req as CustomRequest, res, next)
  )
);

authRouter.post(
  "/updateFullName",
  authenticateJwt,
  validators.fullNameValidator,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    authController.updateFullName(req, res, next)
  )
);

export default authRouter;
