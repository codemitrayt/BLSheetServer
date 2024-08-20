import { config } from "dotenv";
config();

const { PORT, NODE_ENV, DB_URL } = process.env;

const Config = {
  PORT,
  NODE_ENV,
  DB_URL,
};

export default Config;
