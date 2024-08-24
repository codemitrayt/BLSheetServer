import sendVerificationEmailForRegistrationBodyValidator from "./validate-send-verification-email-for-registration-body";
import createPasswordBodyValidator from "./validate-create-password-body";
import loginUserBodyValidator from "./validate-login-user-body";

const validators = {
  sendVerificationEmailForRegistrationBodyValidator,
  createPasswordBodyValidator,
  loginUserBodyValidator,
};

export default validators;
