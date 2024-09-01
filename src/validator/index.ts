import sendVerificationEmailForRegistrationBodyValidator from "./validate-send-verification-email-for-registration-body";
import createPasswordBodyValidator from "./validate-create-password-body";
import loginUserBodyValidator from "./validate-login-user-body";
import selfBodyValidator from "./validate-self-body";
import forgotPasswordBodyValidator from "./validate-forgot-password-body";

import createBlSheetBodyValidator from "./validate-create-bl-sheet-body";
import deleteBlSheetBodyValidator from "./validate-delete-bl-sheet-body";
import editBlSheetQueryValidator from "./validate-edit-bl-sheet-query";
import getBLSheetsQueryValidator from "./validate-get-bl-sheets-query";

import todoValidator from "./validate-todo-body";

const validators = {
  loginUserBodyValidator,
  selfBodyValidator,
  forgotPasswordBodyValidator,
  createPasswordBodyValidator,
  sendVerificationEmailForRegistrationBodyValidator,

  createBlSheetBodyValidator,
  deleteBlSheetBodyValidator,
  editBlSheetQueryValidator,
  getBLSheetsQueryValidator,

  todoValidator,
};

export default validators;
