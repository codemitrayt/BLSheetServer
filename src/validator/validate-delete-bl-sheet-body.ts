import { body } from "express-validator";

const deleteBlSheetBodyValidator = [
  body("objectId").exists().withMessage("objectId should be required."),
];

export default deleteBlSheetBodyValidator;
