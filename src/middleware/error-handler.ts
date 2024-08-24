import { NextFunction, Request, Response } from "express";
import { HttpError } from "http-errors";
import logger from "../config/logger";

const errorHandler = (
  error: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  const statusCode = error.statusCode || error.status || 500;
  return res.status(statusCode).json({
    errors: [
      {
        type: error.name,
        msg: error.message,
        path: "",
        location: "",
      },
    ],
  });
};

export default errorHandler;
