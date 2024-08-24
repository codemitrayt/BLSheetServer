import { Request, Response, NextFunction, RequestHandler } from "express";

const asyncFnHandler = (requestHandler: RequestHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      return next(err);
    });
  };
};

export default asyncFnHandler;
