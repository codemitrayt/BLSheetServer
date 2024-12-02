import { body } from "express-validator";

const fullNameValidator = [
  body("fullName")
    .exists()
    .withMessage("Full Name should be required.")
    .isString()
    .withMessage("Full Name should be string."),
];

export default fullNameValidator;
