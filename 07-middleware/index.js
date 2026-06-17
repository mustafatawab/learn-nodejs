import express from "express";

const app = express();

// ============================================
// MIDDLEWARE CONCEPT #1: What is Middleware?
// ============================================
// Middleware = functions that run between request and response
// Pattern: (req, res, next) => { ... }

// ============================================
// MIDDLEWARE CONCEPT #2: Order Matters
// ============================================

// ============================================
// MIDDLEWARE CONCEPT #3: Attaching Data to req
// ============================================
const authMiddleware = (req, res, next) => {
  // Simulate getting user from database
  req.user = {
    id: 123,
    name: "Mustafa",
    role: "admin"
  };
  console.log(`[Auth] User ${req.user.name} logged in`);
  next();
};

// Apply auth first - so req.user exists for all routes
app.use(authMiddleware);

const logger = (req, res, next) => {
  console.log("[Logger Middleware] This is the logger middleware");
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);

  next(); // Call the next middleware or route handler
  console.log("[Logger Middleware] This will run after the response is sent");
};

// ============================================
//  Middleware #1
// ============================================
app.use(logger); // Apply the logger middleware to all routes



// ============================================
// Middleware #2
// ============================================
app.use((req, res, next) => {
  console.log("[Middleware #2] This is middleware #2");
  next();
  console.log("[Middleware #2] This will run after the response is sent");
});




// ============================================
// Middleware #3
// ============================================
app.use((req, res, next) => {
  console.log("This is middleware #3");
  next();
  console.log("[Middleware #3] This will also run after the response is sent");
});

// ============================================



app.get("/", (req, res) => {
    
  // Access the user we attached in authMiddleware
  res.send(`Hello ${req.user.name}! Your role is: ${req.user.role}`);
});



app.get("/about", (req, res) => {
  res.send("About Page");
});



app.listen(8000, () => {
  console.log("Server is running on port 8000");
});




app.get("/error", (req, res) => {
    throw new Error("This is a test error");
});


app.use((err , req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});