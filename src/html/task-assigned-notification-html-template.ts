interface PropTypes {
  fullName: string;
  ownerName: string;
  taskLink: string;
}

const taskAssignedNotificationHTMLTemplate = ({
  fullName,
  ownerName,
  taskLink,
}: PropTypes) => {
  return `<!DOCTYPE html>
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
      <h2>${ownerName} added a new task for ${fullName}</h2>
      <p>Hi ${fullName},</p>
      <p>
        ${ownerName} has assigned a new task to you, ${fullName}. This task has
        been carefully designated to align with your expertise and project
        priorities. Please review the details and ensure its timely completion.
      </p>
      <p>
        For any clarifications or support, feel free to reach out to
        ${ownerName} or your team lead.
      </p>
      <a href="${taskLink}" class="button">Go To Task</a>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} BL Sheet. All rights reserved.</p>
      </div>

      <div style="color: #555555; margin-top: 30px">
        <div style="font-weight: 700">Welcome to BL Sheet!</div>
        <div style="padding-top: 4px">The BL Sheet Team</div>
      </div>
    </div>
  </body>
</html>
`;
};

export default taskAssignedNotificationHTMLTemplate;
