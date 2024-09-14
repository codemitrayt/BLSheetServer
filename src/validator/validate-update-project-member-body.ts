import { body } from "express-validator";
import { ProjectMemberStatus } from "../types";

const updateProjectMemberValidator = [
  body("memberEmailId")
    .exists()
    .withMessage("Member email should be required.")
    .isEmail()
    .withMessage("Member email should be valid email.")
    .isString()
    .withMessage("Member email should be string."),

  body("invitationToken")
    .exists()
    .withMessage("invitation token should be required.")
    .isString()
    .withMessage("invitation token should be string."),

  body("status")
    .exists()
    .isIn(Object.values(ProjectMemberStatus))
    .withMessage("Member status should be valid status"),
];

export default updateProjectMemberValidator;
