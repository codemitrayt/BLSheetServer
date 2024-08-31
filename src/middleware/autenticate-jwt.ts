import { NextFunction, Response } from "express";
import createHttpError from "http-errors";

import { TokenService } from "../services";
import { CustomRequest } from "../types";

const jwtToken = new TokenService();

const authenticateJWT = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(createHttpError(401, "Unauthorized user"));
  try {
    const token = authHeader.split(" ")[1];
    const user = jwtToken.verifyToken(token);
    req.userId = user.userId;
    next();
  } catch (error) {
    return next(createHttpError(401, "Unauthorized user"));
  }
};

export default authenticateJWT;
