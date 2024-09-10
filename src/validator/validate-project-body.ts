import { body } from "express-validator";

const projectBodyValidator = [
  body("name")
    .exists()
    .withMessage("Project name should be required.")
    .isString()
    .withMessage("Project name should be string."),

  body("description")
    .exists()
    .withMessage("Project description should be required.")
    .isString()
    .withMessage("Project description should be string."),

  body("tags")
    .exists()
    .withMessage("Project tags should be required")
    .isArray()
    .withMessage("Tags should be array"),

  //   body("img").exists().withMessage("Image should be required"),
];

export default projectBodyValidator;
