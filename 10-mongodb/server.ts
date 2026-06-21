import "dotenv/config";
import { env } from "./src/shared/config/env";
import app from "./app";

import { connectDB } from "./src/shared/database/mongodb";

const PORT = env!.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
};

startServer();
