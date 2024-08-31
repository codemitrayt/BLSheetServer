import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import Config from "../config";
import htmlTemplates from "../html";
import {
  AuthService,
  NotificationService,
  TokenService,
  HashService,
} from "../services";

import { URLS } from "../constants";
import {
  CreatePasswordBody,
  CustomRequest,
  EmailBody,
  LoginUserBody,
  SelfBody,
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

    const verificationLink = `${Config.FRONTEND_URL!}${
      URLS.createPasswordUrl
    }?token=${verifyEmailToken}`;
    await this.notificationService.send({
      to: email,
      text: "Send mail",
      subject: "BL Sheet create new password and verify email",
      html: htmlTemplates.verifyEmail({
        fullName,
        verificationLink,
      }),
    });

    return res.json({
      messsage: "Send verification email.",
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

  async self(req: CustomRequest<SelfBody>, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { authToken } = req.body;

    const token = await this.tokenService.verifyToken(authToken);
    if (!token || !token.userId)
      return next(createHttpError(401, "Unauthorized user"));

    const user = await this.authService.findUserById(token.userId);
    if (!user) return next(createHttpError(401, "Unauthorized user"));

    return res.json({ message: { user, authToken } });
  }

  async forgotPassword(
    req: CustomRequest<EmailBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { email } = req.body;
    const user = await this.authService.findUserByEmail(email);
    if (!user) return next(createHttpError(400, "User not found"));

    const EXP = 1000 * 60 * 60;
    const verifyEmailToken = await this.tokenService.signToken(
      { userId: user._id as string },
      EXP
    );

    const verificationLink = `${Config.FRONTEND_URL!}${
      URLS.resetPasswordUrl
    }?token=${verifyEmailToken}`;
    await this.notificationService.send({
      to: email,
      text: "Send mail",
      subject: "BL Sheet create new password",
      html: htmlTemplates.resetPassword({
        fullName: user.fullName,
        verificationLink,
      }),
    });

    return res.json({
      messsage: "Reset password verification email.",
    });
  }

  async resetPassword(
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
    if (!user || !user.userId)
      return next(createHttpError(400, "Invalid token"));

    if ((user?.exp || 0) * 1000 <= Date.now())
      return next(createHttpError(400, "Sorry, your token expired."));

    const existedUser = await this.authService.findByUserId(
      user?.userId as string
    );
    if (!existedUser) return next(createHttpError(400, "User not found!"));

    const hashPassword = await this.hashService.hashData(password);
    const updatedUser = await this.authService.updateUserPassword(
      existedUser._id as string,
      hashPassword
    );

    console.log(updatedUser);

    const jwtToken = await this.tokenService.signToken({
      userId: existedUser._id as string,
      role: existedUser.role,
    });

    return res.json({ message: { user: existedUser, authToken: jwtToken } });
  }
}

export default AuthController;
