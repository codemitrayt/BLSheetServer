import sendVerificationEmailForRegistrationBodyValidator from "./validate-send-verification-email-for-registration-body";
import createPasswordBodyValidator from "./validate-create-password-body";
import loginUserBodyValidator from "./validate-login-user-body";
import createBlSheetBodyValidator from "./validate-create-bl-sheet-body";

const validators = {
  sendVerificationEmailForRegistrationBodyValidator,
  createPasswordBodyValidator,
  loginUserBodyValidator,
  createBlSheetBodyValidator,
};

export default validators;
