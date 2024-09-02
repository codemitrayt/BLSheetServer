import { TodoModel } from "../model";
import { Todo } from "../types";

class TodoService {
  constructor(private todoModel: typeof TodoModel) {}

  async getTodoByIdAndUserId(todoId: string, userId: string) {
    return await this.todoModel.findOne({ userId, _id: todoId });
  }

  async getTodoList(userId: string) {
    return await this.todoModel.find({ userId });
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
