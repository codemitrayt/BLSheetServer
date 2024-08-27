import { query } from "express-validator";

const editBlSheetQueryValidator = [
  query("objectId").exists().withMessage("objectId should be required."),
];

export default editBlSheetQueryValidator;
