import express from "express";

const app = express();

app.use(express.json());

let tasks: { id: number; title: string; description: string }[] = [];

app.get("/health-check", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/tasks", (req, res) => {
  res.json({ tasks: tasks });
});

app.post("/tasks", (req, res) => {
  const { title, description } = req.body;
  const newTask = {
    id: tasks.length + 1,
    title,
    description,
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  return res.json(task);
});

app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and description are required" });
  }

  const task = tasks.find((t) => t.id === taskId);
  console.log(task);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks.map((t) => {
    if (t.id === taskId) {
      t.title = title;
      t.description = description;
    }
  });

  return res.json(task);
});

app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  tasks = tasks.filter((t) => t.id !== taskId);
  return res.json({ message: "Task deleted successfully" });
});

app.listen(9000, () => {
  console.log("Server is running on port 9000");
});
