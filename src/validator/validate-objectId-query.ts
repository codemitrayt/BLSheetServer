import { query } from "express-validator";

const objectIdQueryValidator = [
  query("objectId").exists().withMessage("objectId should be required."),
];

export default objectIdQueryValidator;
