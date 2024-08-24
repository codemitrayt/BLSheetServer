interface PropTypes {
  fullName: string;
  verificationLink: string;
}

const getVerifcationEmailHTMLTemplate = ({
  fullName,
  verificationLink,
}: PropTypes) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification & Create Password</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 50px auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #333333;
                  font-size: 24px;
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
                  color: #ffffff;
                  background-color: #007BFF;
                  text-decoration: none;
                  border-radius: 5px;
              }
              .button:hover {
                  background-color: #0056b3;
              }
              .footer {
                  margin-top: 30px;
                  font-size: 12px;
                  color: #777777;
                  text-align: center;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Email Verification & Create Password</h1>
              <p>Hi ${fullName},</p>
              <p>Thank you for registering with our service. Please click the button below to verify your email address:</p>
              <a href="${verificationLink}" class="button">Verify Email & Create Password</a>
              <p>If you did not register for this account, please ignore this email.</p>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} BL Sheet. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>`;
};

export default getVerifcationEmailHTMLTemplate;
