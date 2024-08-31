import Config from "../config";

interface PropTypes {
  fullName: string;
  verificationLink: string;
}

const getResetPasswordHtmlTemplate = ({
  fullName,
  verificationLink,
}: PropTypes) => {
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification & Create Password</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: black;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #f3f4f6;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #333333;
        font-size: 24px;
        font-weight: 300;
      }
      p {
        color: #555555;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        color: #ffffff !important;
        background-color: #2f667f;
        text-decoration: none;
        border-radius: 5px;
      }
      .button:hover {
        background-color: #2f667f;
        color: #ffffff !important;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #777777;
        text-align: center;
      }
      .divContainer {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      h1 {
        color: #2f667f;
        font-size: 26px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="divContainer">
        <img
          src="${Config.BACKEND_URL}/bl-sheet.png"
          alt="img"
          style="height: 50px"
        />
        <h1>BL Sheet</h1>
      </div>
      <h2>Reset your Password</h2>
      <p>Hi ${fullName},</p>
      <p>We've received a request to reset your password.</p>
      <p>
        If you didn't make the request, just ignore this message. Otherwise, you
        can reset your password.
      </p>
      <p>The link below remain active for 1 hours.</p>
      <a href="${verificationLink}" class="button">Reset Password</a>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} BL Sheet. All rights reserved.</p>
      </div>

      <div style="color: #555555; margin-top: 30px">
        <div style="font-weight: 700">Welcome to BL Sheet!</div>
        <div style="padding-top: 4px">The BL Sheet Team</div>
      </div>
    </div>
  </body>
</html>`;
};

export default getResetPasswordHtmlTemplate;
