import { body } from "express-validator";

const createPasswordBodyValidator = [
  body("password")
    .exists()
    .withMessage("Password should be required.")
    .isString()
    .withMessage("Password should be string."),

  body("confirmPassword")
    .exists()
    .withMessage("Confirm password should be required.")
    .isString()
    .withMessage("Confirm password should be string."),

  body("token").exists().withMessage("Token should be required."),
];

export default createPasswordBodyValidator;
