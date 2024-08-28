import sendVerificationEmailForRegistrationBodyValidator from "./validate-send-verification-email-for-registration-body";
import createPasswordBodyValidator from "./validate-create-password-body";
import loginUserBodyValidator from "./validate-login-user-body";

import createBlSheetBodyValidator from "./validate-create-bl-sheet-body";
import deleteBlSheetBodyValidator from "./validate-delete-bl-sheet-body";
import editBlSheetQueryValidator from "./validate-edit-bl-sheet-query";
import getBLSheetsQueryValidator from "./validate-get-bl-sheets-query";

const validators = {
  sendVerificationEmailForRegistrationBodyValidator,
  createPasswordBodyValidator,
  loginUserBodyValidator,
  createBlSheetBodyValidator,
  deleteBlSheetBodyValidator,
  editBlSheetQueryValidator,
  getBLSheetsQueryValidator,
};

export default validators;
