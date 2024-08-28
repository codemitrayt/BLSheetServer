import { body } from "express-validator";

const selfBodyValidator = [
  body("authToken")
    .exists()
    .withMessage("Token should be required.")
    .isString()
    .withMessage("Token should be string."),
];

export default selfBodyValidator;
