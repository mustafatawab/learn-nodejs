# Neon Database Integration Guide

Complete step-by-step guide to integrate Neon (Serverless PostgreSQL) with Node.js/Express.

---

## Table of Contents

1. [What is Neon?](#what-is-neon)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Neon Account](#step-1-create-neon-account)
4. [Step 2: Install Dependencies](#step-2-install-dependencies)
5. [Step 3: Environment Setup](#step-3-environment-setup)
6. [Step 4: Database Connection](#step-4-database-connection)
7. [Step 5: Create Tables](#step-5-create-tables)
8. [Step 6: CRUD Operations](#step-6-crud-operations)
9. [Step 7: Connect to Express Routes](#step-7-connect-to-express-routes)
10. [Common Issues & Solutions](#common-issues--solutions)

---

## What is Neon?

**Neon** is a serverless PostgreSQL database platform:

- **PostgreSQL** - Same as traditional Postgres, fully compatible
- **Serverless** - Scales automatically, pay for what you use
- **Branching** - Create database branches (like git branches)
- **Connection Pooling** - Built-in, essential for serverless
- **Free Tier** - Generous free tier for learning

### Why Neon over traditional Postgres?

| Feature | Traditional Postgres | Neon |
|---------|---------------------|------|
| Setup | Install/configure | Instant, cloud-based |
| Scaling | Manual | Automatic |
| Connection Pooling | Manual setup | Built-in |
| Branching | Complex | One-click |
| Cost | Server costs | Free tier available |

---

## Prerequisites

Before starting:
- ✅ Node.js installed
- ✅ Basic Express knowledge
- ✅ Understanding of SQL (basics)

---

## Step 1: Create Neon Account

### 1.1 Sign Up

1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (you can use GitHub account)
3. Verify your email

### 1.2 Create a Project

1. Click "New Project"
2. Choose:
   - **Project name**: `learn-nodejs` (or anything)
   - **PostgreSQL version**: 15 (latest stable)
   - **Region**: Pick closest to you (e.g., `US East`)
3. Click "Create Project"

### 1.3 Get Connection String

1. In your project dashboard, click "Connect"
2. Copy the connection string:
   ```
   postgresql://username:password@host.neon.tech/database?sslmode=require
   ```
3. **Save this securely** - it contains your password!

---

## Step 2: Install Dependencies

In your project folder (`007`):

```bash
# Install Neon serverless driver
npm install @neondatabase/serverless

# Install dotenv for environment variables
npm install dotenv
```

### What is @neondatabase/serverless?

This is Neon's official driver. It:
- Handles connection pooling automatically
- Works with serverless environments (Vercel, AWS Lambda)
- Uses WebSocket protocol for better performance

---

## Step 3: Environment Setup

### 3.1 Create .env file

Create a file named `.env` in your project root:

```env
DATABASE_URL=postgresql://username:password@host.neon.tech/database?sslmode=require
PORT=8000
```

**Replace** the DATABASE_URL with your actual connection string from Neon.

### 3.2 Add .env to .gitignore

Create `.gitignore` file:

```
node_modules/
.env
```

**Why?** Never commit passwords to git!

---

## Step 4: Database Connection

### 4.1 Create db.js file

Create `db.js`:

```javascript
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create database connection
const sql = neon(process.env.DATABASE_URL);

// Test connection
async function testConnection() {
  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Database connected!');
    console.log('PostgreSQL version:', result[0].version);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();

export default sql;
```

### 4.2 Import in your main file

In `index.js`, add at the top:

```javascript
import sql from './db.js';
```

### 4.3 Test the connection

Run your server:
```bash
node index.js
```

You should see:
```
✅ Database connected!
PostgreSQL version: PostgreSQL 15.x ...
```

---

## Step 5: Create Tables

### 5.1 Using SQL in code

Create a setup function in `db.js`:

```javascript
// Add this after testConnection

async function createTables() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Tables created!');
  } catch (error) {
    console.error('❌ Failed to create tables:', error.message);
  }
}

// Call after testConnection
createTables();
```

### 5.2 Common Data Types

| Type | Use For | Example |
|------|---------|---------|
| `SERIAL` | Auto-increment ID | `id SERIAL PRIMARY KEY` |
| `VARCHAR(n)` | Short text | `name VARCHAR(100)` |
| `TEXT` | Long text | `description TEXT` |
| `INTEGER` | Whole numbers | `age INTEGER` |
| `BOOLEAN` | True/False | `is_active BOOLEAN` |
| `TIMESTAMP` | Date & time | `created_at TIMESTAMP` |
| `JSONB` | JSON data | `metadata JSONB` |

---

## Step 6: CRUD Operations

### 6.1 CREATE - Insert Data

```javascript
// Insert a single user
async function createUser(name, email) {
  const result = await sql`
    INSERT INTO users (name, email)
    VALUES (${name}, ${email})
    RETURNING *
  `;
  return result[0];
}

// Usage
const newUser = await createUser('Mustafa', 'mustafa@example.com');
console.log('Created:', newUser);
```

**Note:** The `sql` function uses tagged template literals. The `${}` syntax is SAFE - it prevents SQL injection!

### 6.2 READ - Query Data

```javascript
// Get all users
async function getAllUsers() {
  const users = await sql`SELECT * FROM users`;
  return users;
}

// Get user by ID
async function getUserById(id) {
  const users = await sql`SELECT * FROM users WHERE id = ${id}`;
  return users[0]; // Returns single user or undefined
}

// Get user by email
async function getUserByEmail(email) {
  const users = await sql`SELECT * FROM users WHERE email = ${email}`;
  return users[0];
}
```

### 6.3 UPDATE - Modify Data

```javascript
async function updateUser(id, updates) {
  const result = await sql`
    UPDATE users
    SET name = ${updates.name}, email = ${updates.email}
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}

// Usage
const updated = await updateUser(1, {
  name: 'Mustafa Tawab',
  email: 'newemail@example.com'
});
```

### 6.4 DELETE - Remove Data

```javascript
async function deleteUser(id) {
  const result = await sql`
    DELETE FROM users
    WHERE id = ${id}
    RETURNING *
  `;
  return result[0];
}
```

---

## Step 7: Connect to Express Routes

### 7.1 Create a Routes file: `routes/users.js`

```javascript
import express from 'express';
import sql from '../db.js';

const router = express.Router();

// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users`;
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single user
router.get('/:id', async (req, res) => {
  try {
    const users = await sql`SELECT * FROM users WHERE id = ${req.params.id}`;
    if (users.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create user
router.post('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const result = await sql`
      INSERT INTO users (name, email)
      VALUES (${name}, ${email})
      RETURNING *
    `;
    
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const result = await sql`
      UPDATE users
      SET name = ${name}, email = ${email}
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: result[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  try {
    const result = await sql`
      DELETE FROM users
      WHERE id = ${req.params.id}
      RETURNING *
    `;
    
    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### 7.2 Update main index.js

```javascript
import express from 'express';
import sql from './db.js'; // This imports and tests connection
import usersRouter from './routes/users.js';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use('/users', usersRouter);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

app.listen(8000, () => {
  console.log('Server running on port 8000');
});
```

### 7.3 Test the API

```bash
# Get all users
curl http://localhost:8000/users

# Create a user
curl -X POST http://localhost:8000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Mustafa","email":"mustafa@example.com"}'

# Get specific user
curl http://localhost:8000/users/1

# Update user
curl -X PUT http://localhost:8000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Mustafa Updated","email":"new@example.com"}'

# Delete user
curl -X DELETE http://localhost:8000/users/1
```

---

## Common Issues & Solutions

### Issue 1: "Connection refused"

**Cause:** Wrong connection string

**Fix:**
- Double-check your DATABASE_URL
- Make sure `sslmode=require` is included
- Verify the database exists in Neon dashboard

### Issue 2: "relation 'users' does not exist"

**Cause:** Tables not created

**Fix:**
- Run the createTables() function
- Or create tables manually in Neon SQL Editor

### Issue 3: "Cannot use import statement outside a module"

**Cause:** ES modules not enabled

**Fix:**
Add to `package.json`:
```json
{
  "type": "module"
}
```

### Issue 4: Async errors crash server

**Cause:** Unhandled promise rejection

**Fix:** Always use try/catch in async routes:
```javascript
router.get('/', async (req, res) => {
  try {
    // database operations
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Issue 5: "Request body is undefined"

**Cause:** Missing express.json() middleware

**Fix:**
```javascript
app.use(express.json()); // Add this before routes
```

---

## Next Steps

After mastering Neon:

1. **Learn about indexes** - Speed up queries
2. **Learn about joins** - Query related tables
3. **Try MongoDB** - NoSQL alternative
4. **Add authentication** - Protect your routes
5. **Add validation** - Validate user input

---

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQLBolt (Interactive)](https://sqlbolt.com/)

---

*Happy Coding! 🚀*
