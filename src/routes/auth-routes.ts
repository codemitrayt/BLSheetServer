import express, { NextFunction, Request, Response } from "express";

import validators from "../validator";
import UserModel from "../model/user-model";
import asyncFnHandler from "../utils/async-fn-handler";
import AuthController from "../controllers/auth-controller";
import AuthService from "../services/auth-service";
import NotificationService from "../services/notification-service";
import TokenService from "../services/token-service";
import HashService from "../services/hash-service";

import {
  CreatePasswordBody,
  CustomRequest,
  LoginUserBody,
  SendVerificationEmailForRegistrationBody,
} from "../types";

const authRouter = express.Router();
const notificationService = new NotificationService();
const authService = new AuthService(UserModel);
const tokenService = new TokenService();
const hashService = new HashService();
const authController = new AuthController(
  authService,
  notificationService,
  tokenService,
  hashService
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

export default authRouter;
