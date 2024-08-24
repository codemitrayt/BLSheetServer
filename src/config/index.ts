import { config } from "dotenv";
config();

const {
  PORT,
  NODE_ENV,
  DB_URL,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_FROM,
  CREATE_PASSWORD_FRONTEND_URL,
  JWT_SECRET,
} = process.env;

const Config = {
  PORT,
  NODE_ENV,
  DB_URL,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
  MAIL_FROM,
  CREATE_PASSWORD_FRONTEND_URL,
  JWT_SECRET,
};

export default Config;
