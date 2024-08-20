import { config } from "dotenv";
config();

const { PORT, NODE_ENV } = process.env;

const Config = {
  PORT,
  NODE_ENV,
};

export default Config;
