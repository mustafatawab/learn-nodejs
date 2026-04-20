
# Node.js & Express.js - Learning Notes

## Prerequisites

Before starting, you should know:
- ✅ JavaScript basics (variables, functions, async/await)
- ✅ How to use the terminal/command line
- ✅ JSON format

## What is Node.js?

**Node.js** lets you run JavaScript on your computer/server, not just in the browser.

Think of it like this:
- **Browser JavaScript** = Controls what you see on a webpage
- **Node.js** = Controls the server, files, databases

### Quick Comparison

| Feature | Browser JS | Node.js |
|---------|-----------|---------|
| Can access DOM? | ✅ Yes | ❌ No |
| Can read files? | ❌ No | ✅ Yes |
| Can make servers? | ❌ No | ✅ Yes |
| Has `fetch()`? | ✅ Yes | ✅ Yes (built-in) |

## Creating a Node.js Project

### Step 1: Create a folder
```bash
mkdir my-project
cd my-project
```

### Step 2: Initialize Node.js
```bash
npm init -y
```

This creates `package.json` - a file that tracks your project settings and dependencies.

### Step 3: Run JavaScript
Create `index.js`:
```javascript
console.log("Hello from Node.js!");
```

Run it:
```bash
node index.js
```

## What is Express.js?

**Express** is a framework that makes creating web servers easier.

Without Express:
```javascript
// Using native Node.js http module (verbose!)
import { createServer } from "node:http";
const server = createServer((req, res) => {
  if (req.url === "/") {
    res.end("Home");
  } else if (req.url === "/about") {
    res.end("About");
  }
});
server.listen(3000);
```

With Express:
```javascript
import express from "express";
const app = express();

app.get("/", (req, res) => res.send("Home"));
app.get("/about", (req, res) => res.send("About"));

app.listen(3000);
```

Much cleaner!

## Creating an Express Project

### Step 1: Initialize project
```bash
npm init -y
```

### Step 2: Install Express
```bash
npm install express
```

This downloads Express and saves it in `node_modules/`.

### Step 3: Create server file
`index.js`:
```javascript
import express from "express";
const app = express();
const PORT = 3000;

// Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 4: Add "type": "module" to package.json
Your `package.json` should look like:
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "express": "^4.x.x"
  }
}
```

The `"type": "module"` lets you use `import` instead of `require()`.

### Step 5: Run it
```bash
node index.js
```

Then open `http://localhost:3000` in your browser!

## Basic Express Concepts

### Request (req) Object
Information about the incoming request:

| Property | What It Is |
|----------|-----------|
| `req.method` | HTTP method: GET, POST, PUT, DELETE |
| `req.path` | URL path: "/", "/about", etc. |
| `req.params` | URL parameters: `/user/:id` → `req.params.id` |
| `req.query` | Query string: `?name=john` → `req.query.name` |
| `req.body` | Request body (for POST requests) |
| `req.headers` | HTTP headers |

### Response (res) Object
Methods to send responses:

| Method | What It Does |
|--------|-------------|
| `res.send("text")` | Sends text or HTML |
| `res.json({ data })` | Sends JSON response |
| `res.status(404)` | Sets HTTP status code |
| `res.redirect("/url")` | Redirects to another URL |

### Route Examples

```javascript
// GET request
app.get("/users", (req, res) => {
  res.json({ users: ["Alice", "Bob"] });
});

// POST request
app.post("/users", (req, res) => {
  res.status(201).json({ message: "User created" });
});

// URL Parameters
app.get("/users/:id", (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});

// Query Parameters
// URL: /search?q=nodejs
app.get("/search", (req, res) => {
  const searchTerm = req.query.q;
  res.json({ searchingFor: searchTerm });
});
```

---

# Express Middleware - Deep Dive

## What is Middleware?

Think of middleware like **security guards at a building entrance**:

- Every visitor (request) must pass through the guards (middleware)
- Guards can:
  - **Check ID** (authentication)
  - **Write in a logbook** (logging)
  - **Add a visitor badge** (modifying the request)
  - **Stop suspicious people** (blocking requests)
  - **Say "you may enter"** (calling `next()`)

## The Pattern

```javascript
const middleware = (req, res, next) => {
  // Do something before the route handler
  console.log("Before next()");

  next(); // Pass to next middleware or route

  // Do something AFTER the route handler finishes
  console.log("After next()");
};
```

## Key Rule: Order Matters!

Middleware runs in the order you write them:

```
Request comes in
    ↓
Middleware 1 (before next)
    ↓
Middleware 2 (before next)
    ↓
Middleware 3 (before next)
    ↓
Route Handler (sends response)
    ↓
Middleware 3 (after next) ← runs BACKWARDS!
    ↓
Middleware 2 (after next)
    ↓
Middleware 1 (after next)
```

## Real-Life Example

Like a **restaurant visit**:

1. **Host** takes your name (logger middleware)
2. **Waiter** seats you (auth middleware)
3. **Chef** cooks food (route handler)
4. **Waiter** brings bill (after next)
5. **Host** says goodbye (after next)

## Common Built-in Middleware

| Middleware | What It Does |
|------------|--------------|
| `express.json()` | Reads JSON from request body |
| `express.static()` | Serves files (images, CSS, JS) |
| `express.urlencoded()` | Reads form data |

## Attaching Data to Request

You can add custom data to `req` that later middleware/routes can use:

```javascript
const authMiddleware = (req, res, next) => {
  // Attach user to request
  req.user = { id: 123, name: "Mustafa", role: "admin" };
  next();
};

app.use(authMiddleware);

app.get("/", (req, res) => {
  // Access the user we attached
  res.send(`Hello ${req.user.name}!`);
});
```

## Error Handling Middleware

Special middleware with 4 parameters:

```javascript
// Must have 4 parameters!
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Something broke!" });
});
```

---

## Quick Commands Reference

```bash
# Initialize project
npm init -y

# Install package
npm install express

# Run server
node index.js

# Test with curl
curl http://localhost:3000/
```

---

*Learning Progress: 007 - Middleware Deep Dive*
*Folder: /Users/yasirhayat/workspace/learn-nodejs/007*
