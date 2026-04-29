# Prisma Client Setup - Explained

This document explains the `src/lib/prisma.ts` file in simple terms for learning purposes.

---

## The Code

```typescript
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env"

const globalForPrisma = global as unknown as { prisma : PrismaClient}

const adapter = new PrismaPg({
    connectionString : env.DATABASE_URL,
    max : 20,
    idleTimeoutMillis : 30000,
    connectionTimeoutMillis : 5000,
})

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter
})

if (process.env.NODE_ENV !== "production")  globalForPrisma.prisma = prisma
```

---

## Line-by-Line Breakdown

### Lines 1-3: Imports

```typescript
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env";
```

**What this does:**

| Import | Purpose |
|--------|---------|
| `PrismaClient` | The main database client - your gateway to the database |
| `PrismaPg` | A bridge that lets Prisma talk to PostgreSQL databases |
| `env` | Your database URL from environment variables |

---

### Line 5: Global Cache Setup

```typescript
const globalForPrisma = global as unknown as { prisma : PrismaClient}
```

**What this does:** Creates a "global variable" that survives hot reloads during development.

**Why this matters:** During development, when you save a file, Node.js reloads your code. Without this, a **new** Prisma client would be created every time, causing:

- Multiple database connections
- Memory leaks
- Warnings in the console

This line says: *"Check if a Prisma client already exists globally. If yes, reuse it. If no, create a new one."*

---

### Lines 7-12: Database Adapter

```typescript
const adapter = new PrismaPg({
    connectionString : env.DATABASE_URL,
    max : 20,
    idleTimeoutMillis : 30000,
    connectionTimeoutMillis : 5000,
})
```

**What this does:** Configures **how** Prisma connects to your PostgreSQL database.

**The settings explained:**

| Setting | What it does |
|---------|--------------|
| `connectionString` | Your database URL - tells Prisma where your database lives |
| `max: 20` | Maximum 20 connections at once (connection pool size) |
| `idleTimeoutMillis: 30000` | Close unused connections after 30 seconds |
| `connectionTimeoutMillis: 5000` | Wait max 5 seconds to get a connection before failing |

---

### Lines 14-16: Create or Reuse Prisma Client

```typescript
export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter
})
```

**What this does:** The **singleton pattern** in action.

**Translation:** *"Use the existing global Prisma client if it exists. Otherwise, create a brand new one with our adapter settings."*

This ensures your **entire app uses ONE Prisma instance**, not multiple.

---

### Line 18: Save to Global (Dev Only)

```typescript
if (process.env.NODE_ENV !== "production")  globalForPrisma.prisma = prisma
```

**What this does:** Saves the Prisma client to the global variable **only in development**.

**Why not in production?** In production, code doesn't hot-reload, so you don't need this safety net. One instance is created at startup and that's it.

---

## Simple Analogy

Think of your Prisma client like a **coffee machine**:

| Scenario | Without `globalForPrisma` | With `globalForPrisma` |
|----------|---------------------------|------------------------|
| First run | Buy 1 coffee machine | Buy 1 coffee machine |
| After hot reload | Buy another (now 2) | Reuse the existing one |
| After 10 reloads | 11 machines! | Still 1 machine |

---

## Why Create a Separate `prisma.ts` File?

### 1. Single Instance (Singleton Pattern)

Prisma client is expensive to create. If you import `new PrismaClient()` in multiple files, you might accidentally create multiple instances, which causes:

- Connection pool exhaustion
- Slow startup
- Memory leaks

A dedicated file ensures **one shared instance** across your entire app.

### 2. Centralized Configuration

You configure the database connection **once** in a dedicated place:

- Connection pooling settings
- Logging configuration
- Error handling wrappers
- Custom middleware

### 3. Clean Imports Everywhere

Instead of setting up Prisma in every service file, you just do:

```typescript
import { prisma } from "../lib/prisma";
```

### 4. Graceful Shutdown

You need to call `prisma.$disconnect()` when your server stops. Having a single file makes this straightforward.

---

## How to Use It

In your service files (like `todo.service.ts`):

```typescript
import { prisma } from "../lib/prisma";

// Just use it directly - no setup needed!
const todos = await prisma.todo.findMany();
```

---

## Key Takeaways

| Concept | Why It Matters |
|---------|----------------|
| **Singleton** | One DB connection shared everywhere |
| **Global caching** | Prevents re-creation during dev (hot reload) |
| **`$connect()` / `$disconnect()`** | Proper connection lifecycle |
| **Middleware** | Add logging, error handling, query timing |

---

## Self-Check Questions

1. Why do we check `globalForPrisma.prisma` before creating a new client?
2. What would happen if we removed the `globalForPrisma` logic during development?
3. Why is the global save only done in non-production environments?
4. What happens if you create a new `PrismaClient` in every service file?

---

*Generated for learning purposes - 009-todo-with-neon project*
