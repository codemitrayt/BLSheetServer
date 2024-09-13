import { body } from "express-validator";

const inviteProjectMemberValidator = [
  body("email")
    .exists()
    .withMessage("Email should be required.")
    .isEmail()
    .withMessage("Email should be valid email.")
    .isString()
    .withMessage("Email should be string."),

  body("projectId")
    .exists()
    .withMessage("Project Id should be required.")
    .isString()
    .withMessage("Project Id should be string."),
];

export default inviteProjectMemberValidator;
