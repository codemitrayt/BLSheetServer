import app from "./app";
import { Config } from "./config";

const startServer = async () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (error) {
    console.log("Error while listening", error);
    process.exit(1);
  }
};

void startServer();
