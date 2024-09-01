import { body } from "express-validator";
import { TodoLevel, TodoStatus } from "../types";

const todoValidator = [
  body("title")
    .exists()
    .withMessage("Title should be required.")
    .isString()
    .withMessage("Title should be string."),

  body("description")
    .exists()
    .withMessage("Description should be required.")
    .isString()
    .withMessage("Description should be string."),

  body("status")
    .exists()
    .isIn(Object.values(TodoStatus))
    .withMessage("Todo status should be valid todo status"),

  body("level")
    .exists()
    .isIn(Object.values(TodoLevel))
    .withMessage("Todo level should be valid todo level"),
];

export default todoValidator;
