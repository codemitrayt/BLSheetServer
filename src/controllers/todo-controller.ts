import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { AuthService, TodoService } from "../services";
import { CustomRequest, Todo } from "../types";
import { ObjectId } from "mongoose";

class TodoController {
  constructor(
    private todoService: TodoService,
    private authService: AuthService
  ) {}

  async getTodo(req: CustomRequest, res: Response, next: NextFunction) {
    return res.json({ message: "Getting Todo" });
  }

  async getTodoList(req: CustomRequest, res: Response, next: NextFunction) {
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const todoList = await this.todoService.getTodoList(userId);

    return res.json({ message: { todoList } });
  }

  async createTodo(
    req: CustomRequest<Todo>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const todo = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const newTodo = await this.todoService.createTodo({
      ...todo,
      userId: userId as unknown as ObjectId,
    });

    return res.json({ message: { todo: newTodo } });
  }

  async updateTodo(
    req: CustomRequest<Todo>,
    res: Response,
    next: NextFunction
  ) {
    return res.json({ message: "Update Todo" });
  }

  async deleteTodo(req: CustomRequest, res: Response, next: NextFunction) {
    return res.json({ message: "Delete Todo" });
  }
}

export default TodoController;
