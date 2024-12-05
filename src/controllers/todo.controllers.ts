import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { AuthService, TodoService } from "../services";
import {
  CustomRequest,
  DeleteTodoBody,
  GetTodoListQueryParams,
  Todo,
} from "../types";
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

    const todoList = await this.todoService.getTodoList(
      userId,
      req.query as unknown as GetTodoListQueryParams
    );

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
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const todo = req.body;
    const userId = req.userId as string;
    const todoId = req.query.objectId as string;

    const existingTodo = await this.todoService.getTodoByIdAndUserId(
      todoId,
      userId
    );
    if (!existingTodo) return next(createHttpError(400, "Todo not found"));

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    const updatedTodo = await this.todoService.updateTodo(todoId, todo);

    return res.json({ message: { todo: updatedTodo } });
  }

  async deleteTodo(
    req: CustomRequest<DeleteTodoBody>,
    res: Response,
    next: NextFunction
  ) {
    const result = validationResult(req);
    if (!result.isEmpty())
      return next(createHttpError(400, result.array()[0].msg as string));

    const { objectId: todoId } = req.body;
    const userId = req.userId as string;

    const user = await this.authService.findByUserId(userId);
    if (!user) return next(createHttpError(401, "Unauthorized"));

    await this.todoService.deleteTodo(todoId, userId);
    return res.json({
      message: { todoId, info: "Todo deleted successfully." },
    });
  }
}

export default TodoController;
