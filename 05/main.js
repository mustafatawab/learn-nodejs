import express from "express";
const app = express();
import blog from "./routes/blog.js";
const port = 4000;

app.use(express.static("public")); //built in middleware
app.use(blog, "/blog");
app.use((req, res, next) => {
  console.log("middleware 1");
  next();
});

app.get("/", (req, res) => {
  res.send("Home route");
});

app.listen(port, () => {
  console.log("the server is running on ", port);
});
