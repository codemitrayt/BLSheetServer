import { body } from "express-validator";

const forgotPasswordBodyValidator = [
  body("email")
    .exists()
    .withMessage("Email should be required.")
    .isEmail()
    .withMessage("Email should be valid email.")
    .isString()
    .withMessage("Email should be string."),
];

export default forgotPasswordBodyValidator;
