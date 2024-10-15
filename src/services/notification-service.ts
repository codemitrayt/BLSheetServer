import nodemailer, { TransportOptions } from "nodemailer";
// import { Resend } from "resend";

import Config from "../config";
import { Message } from "../types";

class NotificationService {
  private transporter;
  // private resend;
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

    // this.resend = new Resend(Config.RESEND_API_KEY!);
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

  // async sendWithResend(message: Message) {
  //   const { error, data } = await this.resend.emails.send({
  //     from: Config.MAIL_FROM!,
  //     to: [message.to],
  //     subject: message.subject!,
  //     html: message.html!,
  //   });
  //   if (error) throw Error("Email send failed");
  // }
}

export default NotificationService;
