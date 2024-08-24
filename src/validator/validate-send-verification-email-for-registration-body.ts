import { body } from "express-validator";

const sendVerificationEmailForRegistrationBodyValidator = [
  body("fullName")
    .exists()
    .withMessage("Full Name should be required.")
    .isString()
    .withMessage("Full Name should be string."),

  body("email")
    .exists()
    .withMessage("Email should be required.")
    .isEmail()
    .withMessage("Email should be valid email.")
    .isString()
    .withMessage("Email should be string."),
];

export default sendVerificationEmailForRegistrationBodyValidator;
