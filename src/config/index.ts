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
  JWT_SECRET,
  BACKEND_URL,
  FRONTEND_URL,
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
  JWT_SECRET,
  BACKEND_URL,
  FRONTEND_URL,
};

export default Config;
