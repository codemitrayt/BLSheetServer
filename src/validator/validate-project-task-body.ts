import { body } from "express-validator";
import { ProjectTaskPriority, ProjectTaskStatus } from "../types";

const projectTaskBodyValidator = [
  body("title").exists().withMessage("Title should be required."),

  // body("description").exists().withMessage("Description should be required."),

  body("status")
    .exists()
    .isIn(Object.values(ProjectTaskStatus))
    .withMessage("Project task status should be valid project task status"),

  body("priority")
    .exists()
    .isIn(Object.values(ProjectTaskPriority))
    .withMessage("Project priority should be valid project priority"),

  // body("tags")
  //   .exists()
  //   .withMessage("Tags should be required")
  //   .isArray()
  //   .withMessage("Tags should be array"),

  body("startDate")
    .exists()
    .withMessage("Start date should be required.")
    .isISO8601()
    .toDate()
    .withMessage("Start date should be date type."),

  body("endDate")
    .exists()
    .withMessage("End date should be required.")
    .isISO8601()
    .toDate()
    .withMessage("End date should be date type."),

  body("projectId").exists().withMessage("Project id should be required"),
];

export default projectTaskBodyValidator;
