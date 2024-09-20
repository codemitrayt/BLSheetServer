import { body } from "express-validator";

const assignMemberToProjectTaskBodyValidator = [
  body("memberEmailId")
    .exists()
    .withMessage("Member email should be required."),
  body("projectId").exists().withMessage("Project id should be required."),
  body("projectTaskId")
    .exists()
    .withMessage("Project task id should be required."),
];

export default assignMemberToProjectTaskBodyValidator;
