export const template = ({code, name, subject}:{code:string,name:string,subject:string}) => `<!DOCTYPE html>
<html>
<head>
  <style>
    .email-container {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 20px;
      background-color: #f9f9f9;
    }

    .email-header {
      background-color: #007BFF;
      color: white;
      padding: 10px 20px;
      text-align: center;
    }

    .email-body {
      padding: 20px;
      font-size: 16px;
      color: #333;
    }

    .activation-button {
      color: #007BFF;
      font-weight: bold;
    }

    .email-footer {
      text-align: center;
      font-size: 12px;
      color: #777;
      margin-top: 20px;
    }

    .email-footer a {
      color: #007BFF;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>${subject}</h1>
    </div>
    <div class="email-body">
      <h2>Hello ${name},</h2>
      <p>Thank you for signing up with Route Academy. To complete your registration and start using your account, please use the code below:</p>
      <h2 class="activation-button">${code}</h2>
      <p>If you did not sign up for this account, please ignore this email.</p>
      <p>Best regards,<br>Social Media Team</p>
    </div>
    <div class="email-footer">
      <p>&copy; 2024 Route Academy. All rights reserved.</p>
      <p>
        <a href="[SupportLink]">Contact Support</a> |
        <a href="[UnsubscribeLink]">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;
