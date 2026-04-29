import { app } from "./app";
import { env } from "./src/config/env";

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  console.log("Database URL:", env.DATABASE_URL);
});


