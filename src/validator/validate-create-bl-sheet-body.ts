import { body } from "express-validator";
import { SheetType } from "../types";

const createBlSheetBodyValidator = [
  body("clientName")
    .exists()
    .withMessage("Client name should be required.")
    .isString()
    .withMessage("Client name should be string."),

  body("description")
    .exists()
    .withMessage("Description should be required.")
    .isString()
    .withMessage("Description should be string."),

  body("money")
    .exists()
    .withMessage("Money should be required.")
    .isNumeric()
    .withMessage("Money should be number."),

  body("isPaid")
    .exists()
    .withMessage("isPaid should be required.")
    .isBoolean()
    .withMessage("isPaid should be boolean type."),

  body("tax")
    .exists()
    .withMessage("Tax should be required.")
    .isNumeric()
    .withMessage("Tax should be number."),

  body("date")
    .exists()
    .withMessage("Date should be required.")
    .isISO8601()
    .toDate()
    .withMessage("Date should be date type."),

  body("type")
    .exists()
    .isIn(Object.values(SheetType))
    .withMessage("Type should be valid sheet type"),

  body("totalMoney")
    .exists()
    .withMessage("Total money should be required.")
    .isNumeric()
    .withMessage("Total money should be number."),
];

export default createBlSheetBodyValidator;
