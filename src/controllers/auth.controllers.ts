import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import { Logger } from "winston";
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
import EVENTS from "../constants/events";

class AuthController {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private tokenService: TokenService,
    private hashService: HashService,
    private logger: Logger
  ) {}

  async sendVerificationEmailForRegistration(
    req: CustomRequest<SendVerificationEmailForRegistrationBody>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { email, fullName } = req.body;
    this.logger.info({ event: EVENTS.SIGN_UP, data: { email } });

    /** Chcek user already exists or not */
    const user = await this.authService.findUserByEmail(email);
    if (user)
      return next(
        createHttpError(
          400,
          "Email already exists. Please use a different email address."
        )
      );

    /** Generate token, validate for 5 min */
    const EXP = 1000 * 60 * 5;
    const verifyEmailToken = await this.tokenService.signToken(
      { email, fullName },
      EXP
    );

    /** Generate verification link */
    const verificationLink = `${Config.FRONTEND_URL!}${
      URLS.createPasswordUrl
    }?token=${verifyEmailToken}`;

    /** Send notification to user email for create password */
    await this.notificationService.send({
      to: email,
      text: "Send mail",
      subject: "BL Sheet: Please Verify Your Email to Complete Registration",
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
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { password, confirmPassword, token } = req.body;
    this.logger.info({ event: EVENTS.SIGN_UP, data: { token } });

    /** Check password and confirm password is same */
    if (password !== confirmPassword)
      return next(
        createHttpError(400, "Password and confirm password does not match.")
      );

    /** Validate token for register user */
    const user = await this.tokenService.verifyToken(token);
    if (!user || !user.email || !user.fullName)
      return next(
        createHttpError(400, "Invalid token. Please provide a valid token.")
      );

    /** Check token validity */
    if ((user?.exp || 0) * 1000 <= Date.now())
      return next(createHttpError(400, "Sorry, your token has expired."));

    /** Check user already registered */
    const isUserExist = await this.authService.findUserByEmail(user?.email);
    if (isUserExist) return next(createHttpError(400, "User already exists"));

    const hashPassword = await this.hashService.hashData(password);

    const updatedUser = await this.authService.createUser({
      email: user.email,
      fullName: user.fullName,
      password: hashPassword,
    });

    this.logger.info({
      event: EVENTS.CREATE_PASSWORD,
      data: { email: updatedUser.email, userId: updatedUser._id },
    });

    /** Generate jwt token */
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
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { password, email } = req.body;
    this.logger.info({ event: EVENTS.LOGIN, data: { email } });

    /** Check password entered correct */
    const user = await this.authService.findUserByEmail(email);
    if (!user) return next(createHttpError(400, "User not found."));

    const isPasswordMatch = await this.hashService.hashCompare(
      password,
      user.password!
    );
    if (!isPasswordMatch)
      return next(
        createHttpError(
          400,
          "Email or password entered is incorrect. Please try again."
        )
      );

    /** Generate jwt token */
    const jwtToken = await this.tokenService.signToken({
      userId: user._id as string,
      role: user.role,
    });

    return res.json({ message: { user, authToken: jwtToken } });
  }

  async self(req: CustomRequest<SelfBody>, res: Response, next: NextFunction) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { authToken } = req.body;

    /** Verify token */
    const token = await this.tokenService.verifyToken(authToken);
    if (!token || !token.userId)
      return next(createHttpError(401, "Unauthorized user"));

    /** Check user */
    const user = await this.authService.findUserById(token.userId);
    if (!user) return next(createHttpError(401, "Unauthorized user"));

    return res.json({ message: { user, authToken } });
  }

  async forgotPassword(
    req: CustomRequest<EmailBody>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { email } = req.body;
    this.logger.info({ event: EVENTS.FORGOT_PASSWORD, data: { email } });

    /** User check  */
    const user = await this.authService.findUserByEmail(email);
    if (!user) return next(createHttpError(400, "User not found"));

    /** Check expiry */
    const EXP = 1000 * 60 * 60;
    const verifyEmailToken = await this.tokenService.signToken(
      { userId: user._id as string },
      EXP
    );

    /** Generate verification link */
    const verificationLink = `${Config.FRONTEND_URL!}${
      URLS.resetPasswordUrl
    }?token=${verifyEmailToken}`;

    /** Send notification to user email for create new password */
    await this.notificationService.send({
      to: email,
      text: "Send mail",
      subject: "Reset Your BL Sheet Password",
      html: htmlTemplates.resetPassword({
        fullName: user.fullName,
        verificationLink,
      }),
    });

    return res.json({
      messsage: "Sent reset password verification link email.",
    });
  }

  async resetPassword(
    req: CustomRequest<CreatePasswordBody>,
    res: Response,
    next: NextFunction
  ) {
    /** Validate request body */
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { password, confirmPassword, token } = req.body;
    this.logger.info({ event: EVENTS.RESET_PASSWORD, data: { token } });

    if (password !== confirmPassword)
      return next(
        createHttpError(400, "Password and confirm password does not match.")
      );

    /** Verify token */
    const user = await this.tokenService.verifyToken(token);
    if (!user || !user.userId)
      return next(createHttpError(400, "Invalid token"));

    /** Check token expiry */
    if ((user?.exp || 0) * 1000 <= Date.now())
      return next(createHttpError(400, "Sorry, your token expired."));

    /** Check user exists or not */
    const existedUser = await this.authService.findByUserId(
      user?.userId as string
    );
    if (!existedUser) return next(createHttpError(400, "User not found!"));

    const hashPassword = await this.hashService.hashData(password);
    await this.authService.updateUserPassword(
      existedUser._id as string,
      hashPassword
    );

    /** Generate jwt token */
    const jwtToken = await this.tokenService.signToken({
      userId: existedUser._id as string,
      role: existedUser.role,
    });

    return res.json({ message: { user: existedUser, authToken: jwtToken } });
  }
}

export default AuthController;
