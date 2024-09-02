import { body } from "express-validator";

const deleteObjectBodyValidator = [
  body("objectId").exists().withMessage("objectId should be required."),
];

export default deleteObjectBodyValidator;
