import { body } from "express-validator";

const objectIdBodyValidator = [
  body("objectId").exists().withMessage("objectId should be required."),
];

export default objectIdBodyValidator;
