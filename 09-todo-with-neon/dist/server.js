import { app } from "./app.js";
import { env } from "./src/shared/config/env.js";
app.listen(9000, () => {
    console.log("Server is running on port 9000");
    console.log("Database URL:", env.DATABASE_URL);
});
//# sourceMappingURL=server.js.map