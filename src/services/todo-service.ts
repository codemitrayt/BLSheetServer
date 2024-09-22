import mongoose, { PipelineStage } from "mongoose";
import { TodoModel } from "../model";
import { GetTodoListQueryParams, Todo } from "../types";

class TodoService {
  constructor(private todoModel: typeof TodoModel) {}

  async getTodoByIdAndUserId(todoId: string, userId: string) {
    return await this.todoModel.findOne({ userId, _id: todoId });
  }

  async getTodoList(userId: string, query: GetTodoListQueryParams) {
    const date = query.date ? new Date(query.date) : new Date();

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          status: 1,
          level: 1,
          createdAt: 1,
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
      },
      {
        $match: {
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          day: date.getDate(),
        },
      },
      {
        $project: {
          year: 0,
          month: 0,
          day: 0,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];

    const result = await this.todoModel.aggregate(pipeline).exec();
    return result;
  }

  async createTodo(todo: Todo) {
    return await this.todoModel.create(todo);
  }

  async updateTodo(todoId: string, todo: Todo) {
    return await this.todoModel.findByIdAndUpdate(todoId, todo, {
      new: true,
    });
  }

  async deleteTodo(todoId: string, userId: string) {
    return await this.todoModel.findByIdAndDelete({ _id: todoId, userId });
  }
}

export default TodoService;
