import nodemailer, { TransportOptions } from "nodemailer";

import Config from "../config";
import { Message } from "../types";

class NotificationService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: Config.MAIL_HOST,
      port: Config.MAIL_PORT,
      secure: false,
      auth: {
        user: Config.MAIL_USERNAME,
        pass: Config.MAIL_PASSWORD,
      },
    } as TransportOptions);
  }

  async send(message: Message) {
    await this.transporter.sendMail({
      from: Config.MAIL_FROM,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  }
}

export default NotificationService;
