import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import Config from "../config";
import AuthService from "../services/auth-service";
import NotificationService from "../services/notification-service";
import TokenService from "../services/token-service";
import HashService from "../services/hash-service";
import getVerifcationEmailHTMLTemplate from "../html/get-verifcation-html-template";

import {
  CreatePasswordBody,
  CustomRequest,
  LoginUserBody,
  SendVerificationEmailForRegistrationBody,
} from "../types";

class AuthController {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private tokenService: TokenService,
    private hashService: HashService
  ) {}

  async sendVerificationEmailForRegistration(
    req: CustomRequest<SendVerificationEmailForRegistrationBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { email, fullName } = req.body;
    const user = await this.authService.findUserByEmail(email);
    if (user) return next(createHttpError(400, "Email already exists."));

    const EXP = 1000 * 60 * 5;
    const verifyEmailToken = await this.tokenService.signToken(
      { email, fullName },
      EXP
    );

    const verificationLink = `${Config.CREATE_PASSWORD_FRONTEND_URL!}?token=${verifyEmailToken}`;
    await this.notificationService.send({
      to: email,
      text: "Send mail",
      subject: "BL Sheet create new password and verify email",
      html: getVerifcationEmailHTMLTemplate({
        fullName,
        verificationLink,
      }),
    });

    return res.json({
      messsage: "Send verification email.",
      token: verifyEmailToken,
    });
  }

  async createPassword(
    req: CustomRequest<CreatePasswordBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword)
      return next(
        createHttpError(400, "Password and confirm password does not match.")
      );

    const user = await this.tokenService.verifyToken(token);
    if (!user || !user.email || !user.fullName)
      return next(createHttpError(400, "Invalid token"));

    if ((user?.exp || 0) * 1000 <= Date.now())
      return next(createHttpError(400, "Sorry, your token expired."));

    const isUserExist = await this.authService.findUserByEmail(user?.email);
    if (isUserExist) return next(createHttpError(400, "User already exists"));

    const hashPassword = await this.hashService.hashData(password);

    const updatedUser = await this.authService.createUser({
      email: user.email,
      fullName: user.fullName,
      password: hashPassword,
    });

    const jwtToken = await this.tokenService.signToken({
      userId: updatedUser._id as string,
      role: updatedUser.role,
    });

    return res.json({ message: { user: updatedUser, authToken: jwtToken } });
  }

  async login(
    req: CustomRequest<LoginUserBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { password, email } = req.body;
    const user = await this.authService.findUserByEmail(email);
    if (!user)
      return next(createHttpError(400, "Email or password entered wrong."));

    const isPasswordMatch = await this.hashService.hashCompare(
      password,
      user.password!
    );
    if (!isPasswordMatch)
      return next(createHttpError(400, "Email or password not match."));

    const jwtToken = await this.tokenService.signToken({
      userId: user._id as string,
      role: user.role,
    });

    return res.json({ message: { user, authToken: jwtToken } });
  }
}

export default AuthController;
