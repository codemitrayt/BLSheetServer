import express, { NextFunction, Request, Response } from "express";

import asyncFnHandler from "../utils/async-fn-handler";
import authenticateJWT from "../middleware/autenticate-jwt";

import { TodoController } from "../controllers";
import { AuthService, TodoService } from "../services";

import { CustomRequest, Todo } from "../types";
import { TodoModel, UserModel } from "../model";
import validators from "../validator";

const todoRouter = express.Router();
const authService = new AuthService(UserModel);
const todoService = new TodoService(TodoModel);
const todoController = new TodoController(todoService, authService);

todoRouter.get(
  "/getTodo",
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    todoController.getTodo(req, res, next)
  )
);

todoRouter.get(
  "/getTodoList",
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    todoController.getTodoList(req, res, next)
  )
);

todoRouter.post(
  "/createTodo",
  validators.todoValidator,
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    todoController.createTodo(req as CustomRequest<Todo>, res, next)
  )
);

todoRouter.put(
  "/updateTodo",
  validators.todoValidator,
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    todoController.updateTodo(req as CustomRequest<Todo>, res, next)
  )
);

todoRouter.delete(
  "/deleteTodo",
  authenticateJWT,
  asyncFnHandler((req: Request, res: Response, next: NextFunction) =>
    todoController.deleteTodo(req, res, next)
  )
);

export default todoRouter;
