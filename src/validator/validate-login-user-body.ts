import { body } from "express-validator";

const loginUserBodyValidator = [
  body("email")
    .exists()
    .withMessage("Email should be required.")
    .isEmail()
    .withMessage("Email should be valid email.")
    .isString()
    .withMessage("Email should be string."),

  body("password")
    .exists()
    .withMessage("Password should be required.")
    .isString()
    .withMessage("Password should be string."),
];

export default loginUserBodyValidator;
