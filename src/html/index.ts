import getVerifcationEmailHTMLTemplate from "./get-verifcation-html-template";
import getResetPasswordHtmlTemplate from "./reset-password-html-template";
import projectMemberInvitationTemplate from "./project-member-invitation-template";

export default {
  resetPassword: getResetPasswordHtmlTemplate,
  verifyEmail: getVerifcationEmailHTMLTemplate,
  inviteProjectMember: projectMemberInvitationTemplate,
};
