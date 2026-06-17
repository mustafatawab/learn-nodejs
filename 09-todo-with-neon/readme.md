# Node.js Authentication & Security — Complete Learning Guide

> A comprehensive guide covering Middleware, Authentication, Authorization, CSRF Protection, and production-grade patterns built with Node.js + Express + TypeScript + Prisma.

---

## Table of Contents

1. [Middleware](#1-middleware)
2. [Authentication vs Authorization](#2-authentication-vs-authorization)
3. [JWT — Access & Refresh Tokens](#3-jwt--access--refresh-tokens)
4. [Auth Middleware](#4-auth-middleware)
5. [Building the Auth Module](#5-building-the-auth-module)
6. [Refresh Token Rotation](#6-refresh-token-rotation)
7. [Logout & Token Invalidation](#7-logout--token-invalidation)
8. [CSRF Protection](#8-csrf-protection)
9. [Project Structure](#9-project-structure)
10. [Error Handling Middleware](#10-error-handling-middleware)
11. [Cookie Security](#11-cookie-security)
12. [Production Checklist](#12-production-checklist)

---

## 1. Middleware

### What is Middleware?

Middleware is just a function. Every route handler is also middleware. The only difference is whether it calls `next()`.

```typescript
// Middleware — passes control forward
app.use((req, res, next) => {
  console.log('Request received:', req.method, req.path);
  next(); // passes control to the next function in the chain
});

// Route handler — ends the chain
app.get('/users', (req, res) => {
  res.json({ users: [] }); // ends the response
});
```

### The Middleware Pipeline

Express processes every request through a **pipeline** of functions registered in order. Each function either:
- Calls `next()` → passes control forward
- Calls `res.json()` / `res.send()` → ends the chain
- Calls `next(error)` → jumps to error-handling middleware

```
Request
  │
  ▼
logger middleware      → next() →
cors middleware        → next() →
auth middleware        → next() →
your route handler     → res.json() → Response
```

### Order Matters

```typescript
// ✅ Correct — public routes before global middleware
app.use('/api/auth', authRouter);   // login, register — no token needed
app.use(authenticate);              // everything after requires auth
app.use('/api/todos', todoRouter);  // protected

// ❌ Wrong — auth blocks the login route itself
app.use(authenticate);
app.use('/api/auth', authRouter);   // login will be rejected 401
```

### Attaching Data to req

Middleware can attach data to `req` so downstream functions can use it:

```typescript
const authMiddleware = (req, res, next) => {
  const user = decodeToken(req.cookies.accessToken);
  req.user = user; // ✅ available in all subsequent handlers
  next();
};

app.get('/dashboard', authMiddleware, (req, res) => {
  res.json({ user: req.user }); // req.user is populated
});
```

### Key Rules

- Middleware runs in the order it is registered
- `app.use(fn)` runs for ALL requests matching that path
- Route handlers (`app.get`, `app.post`) match specific method + path
- Always call either `next()` or send a response — never both

---

## 2. Authentication vs Authorization

| Concept | Question | Example |
|---|---|---|
| **Authentication** | Who are you? | Verifying email + password, validating JWT |
| **Authorization** | What can you do? | Admin can delete users, Staff cannot |

```
Request → authenticate (who are you?) → authorize (what can you do?) → route handler
```

---

## 3. JWT — Access & Refresh Tokens

### Why Two Tokens?

| Token | Purpose | Expiry | Storage |
|---|---|---|---|
| `accessToken` | Proves identity on every request | Short (15 min) | HttpOnly cookie |
| `refreshToken` | Gets a new accessToken when expired | Long (7 days) | HttpOnly cookie + Database |

Short-lived access tokens minimize damage if stolen. Refresh tokens enable seamless re-authentication without re-entering credentials.

### Generating Tokens

```typescript
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: TokenPayload, expiresIn: string) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, { expiresIn });
};

export const generateRefreshToken = (payload: TokenPayload, expiresIn: string) => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, { expiresIn });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as TokenPayload;
  } catch {
    return null;
  }
};
```

### Token Payload

Keep JWT payloads small — they're decoded on every request:

```typescript
// ✅ Good — minimal, stable data
const payload = { userId: user.id, email: user.email };

// ❌ Bad — too much data, roles can change
const payload = { userId: user.id, email: user.email, roles: [...], permissions: [...] };
```

---

## 4. Auth Middleware

### Extending Express Request Type

TypeScript doesn't know about `req.user` by default. Fix this once with a declaration file:

```typescript
// src/types/express.d.ts
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}
```

### The Authenticate Middleware

```typescript
// src/shared/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      throw new AppError('Authentication token is missing', 401);
    }

    const decoded = verifyAccessToken(accessToken);

    if (!decoded) {
      throw new AppError('Invalid or expired token', 401);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(new AppError('Unauthorized — invalid token', 401));
  }
};
```

### Why 401 not 404?

- `401 Unauthorized` → not authenticated (missing or invalid token)
- `403 Forbidden` → authenticated but not authorized (valid token, wrong role)
- `404 Not Found` → resource doesn't exist

---

## 5. Building the Auth Module

### Register

```typescript
// auth.service.ts
export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) throw new AppError('User with this email already exists', 400);

  const hashedPassword = await hashPassword(input.password);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
  });
};
```

### Login

```typescript
export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new AppError('Invalid email or password', 401);

  const isValid = await comparePasswords(input.password, user.password);
  if (!isValid) throw new AppError('Invalid email or password', 401);

  const payload = { userId: user.id, email: user.email };

  const accessToken = generateToken(payload, '15m');
  const refreshToken = generateRefreshToken(payload, '7d');
  const csrfToken = generateCsrfToken();

  // Store refresh token in DB for rotation & invalidation
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken, csrfToken };
};
```

### Login Controller — Setting Cookies

```typescript
export const loginUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);

    // HttpOnly — JS cannot read these (XSS protection)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes — matches token expiry
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Non-HttpOnly — frontend JS needs to read this for CSRF protection
    res.cookie('csrfToken', result.csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // matches refresh token
    });

    // Never expose tokens in response body
    return res.status(200).json({ message: 'Logged in successfully' });
  } catch (error) {
    return next(error);
  }
};
```

### Get Current User (/me)

```typescript
// Service — fetch fresh user data from DB
export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);

  const { password, refreshToken, ...safeUser } = user;
  return safeUser; // never return password or refreshToken
};

// Controller — uses req.user populated by authenticate middleware
export const getMeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const result = await getMe(userId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
```

> **Why `findUnique` over `findFirst` for ID lookups?**
> `findUnique` tells Prisma and the database the field is unique — faster and semantically correct. `findFirst` is for non-unique fields.

---

## 6. Refresh Token Rotation

### Why Rotate?

If a refresh token is stolen, an attacker can use it indefinitely. Rotation means every use produces a **new token**, invalidating the old one.

### Reuse Detection (Nuclear Option)

If an **already-rotated** token is presented, it could mean an attacker is using a stolen old token. The correct response is to **invalidate all sessions** for that user.

```typescript
export const refreshToken = async (token: string) => {
  // 1. Verify JWT signature
  const decoded = verifyRefreshToken(token);
  if (!decoded) throw new AppError('Invalid refresh token', 401);

  // 2. Check token exists in DB (reuse detection)
  const user = await prisma.user.findFirst({
    where: { id: decoded.userId, refreshToken: token },
  });

  if (!user) {
    // 🚨 Token reuse detected — nuke ALL sessions for this user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { refreshToken: null },
    });
    throw new AppError('Refresh token reuse detected. Please login again.', 401);
  }

  // 3. Generate new tokens
  const payload = { userId: decoded.userId, email: decoded.email };
  const newAccessToken = generateToken(payload, '15m');
  const newRefreshToken = generateRefreshToken(payload, '7d');
  const newCsrfToken = generateCsrfToken();

  // 4. Rotate — replace old with new in DB
  await prisma.user.update({
    where: { id: decoded.userId },
    data: { refreshToken: newRefreshToken },
  });

  return { newAccessToken, newRefreshToken, newCsrfToken };
};
```

### Refresh Token Handler

```typescript
export const refreshTokenHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) throw new AppError('Refresh token missing', 401);

    const { newAccessToken, newRefreshToken, newCsrfToken } = await refreshToken(token);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000, // ✅ must match token expiry
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie('csrfToken', newCsrfToken, {
      httpOnly: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: 'Tokens refreshed' });
  } catch (error) {
    return next(error);
  }
};
```

### Frontend Token Refresh Flow

When the access token expires, the server returns `401`. The frontend should automatically call `/refresh-token` and retry:

```typescript
// Using axios interceptors
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post('/api/auth/refresh-token');
        return axios(originalRequest); // retry original request
      } catch {
        window.location.href = '/login'; // refresh failed, redirect to login
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 7. Logout & Token Invalidation

### Simple Logout (Cookie Clearing + DB Cleanup)

```typescript
// Service
export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null }, // invalidate refresh token in DB
  });
};

// Controller
export const logoutUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    await logoutUser(userId);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('csrfToken');

    req.user = undefined;

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return next(error);
  }
};
```

### The Access Token Problem

Clearing cookies doesn't invalidate the access token itself — it's still cryptographically valid until it expires. If someone copied it before logout:

| Approach | Complexity | Protection |
|---|---|---|
| Short expiry (15 min) | None | Limits damage window |
| Redis blocklist | Medium | Full invalidation |
| Database blocklist | Low | Full invalidation, slower |

### Redis Blocklist (Production Pattern)

```typescript
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

// On logout — add token to blocklist
export const blockToken = async (token: string, expirySeconds: number) => {
  await redis.setEx(`blocklist:${token}`, expirySeconds, '1');
};

// In authenticate middleware — check blocklist
export const isTokenBlocked = async (token: string): Promise<boolean> => {
  const result = await redis.get(`blocklist:${token}`);
  return result !== null;
};
```

> **Why Redis over PostgreSQL for blocklists?**
> Every request checks the blocklist — it must be fast. Redis stores in RAM (microseconds), PostgreSQL reads from disk (milliseconds). Redis also supports automatic key expiry, so old tokens clean themselves up.

---

## 8. CSRF Protection

### What is CSRF?

Cross-Site Request Forgery tricks the browser into making requests on behalf of the user. The browser automatically sends cookies with every request — even ones initiated by malicious sites.

```
1. User logs into mybank.com → session cookie stored
2. User visits evil.com in another tab
3. evil.com silently submits a form to mybank.com
4. Browser auto-attaches mybank.com cookie to the request
5. Bank sees valid cookie → processes the request 😈
```

**The key insight:** `evil.com` can't read `mybank.com`'s cookies (domain scoping). But it can make the browser *use* them. The `evil.com` has this 

```html
<form action="https://yourapp.com/api/todos" method="POST">
  <input name="title" value="hacked!" />
</form>

<script>
  document.forms[0].submit(); // fires automatically on page load 😈
</script>

```

### The Fix: Double Submit Cookie Pattern

The server generates a CSRF token and sends it in two ways:
1. A **non-HttpOnly cookie** (frontend JS can read it)
2. Frontend must attach it to every state-changing request **header**

`evil.com` cannot read `mybank.com`'s non-HttpOnly cookie (domain scoping), so it cannot put the token in the header. The server verifies both match.

```
Legitimate request:           Forged request:
Cookie: csrfToken=abc123  ✅  Cookie: csrfToken=abc123  ✅ (browser auto-sends)
Header: X-CSRF-Token: abc123 ✅  Header: X-CSRF-Token: ???  ❌ (evil.com can't read it)
```

### Generating the CSRF Token

```typescript
import crypto from 'crypto';

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex'); // 64-char random string
};
```

### CSRF Middleware

```typescript
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

// GET, HEAD, OPTIONS are read-only — nothing to protect
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Routes that don't have a CSRF token yet (user not logged in)
const CSRF_EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh-token',
];

// Safe path matching — prevents accidental exemption of similar routes
const isCsrfExempt = (path: string): boolean => {
  return CSRF_EXEMPT_PATHS.some(
    (exemptPath) => path === exemptPath || path.startsWith(exemptPath + '/')
  );
};

export const csrfMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // 1. Skip read-only methods — they can't mutate data
  if (SAFE_METHODS.includes(req.method)) return next();

  // 2. Skip public routes — user hasn't logged in yet, no token exists
  const fullPath = req.originalUrl.split('?')[0];
  if (isCsrfExempt(fullPath)) return next();

  // 3. Extract tokens from both locations
  const cookieToken = req.cookies['csrfToken'];
  const headerToken = req.headers['x-csrf-token'] as string;

  // 4. Both must be present
  if (!cookieToken || !headerToken) {
    return res.status(403).json({ success: false, message: 'CSRF token missing' });
  }

  // 5. Timing-safe comparison — prevents timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  next();
};
```

### Why `timingSafeEqual` instead of `===`?

A simple string comparison (`===`) short-circuits at the first mismatch:

```
real:  "abc123xyz"
fake:  "abc999xyz"
         ↑ stops here — 3ms
```

An attacker can measure response time differences and guess the token character by character (**timing attack**). `crypto.timingSafeEqual` always takes the same time regardless of where the mismatch is.

### SAFE_METHODS — Why These Three?

- `GET` → reads data, no side effects
- `HEAD` → like GET but no response body, used for checking resource existence
- `OPTIONS` → used by browsers for CORS preflight, no data mutation

### Placement in app.ts

```typescript
app.use(express.json());
app.use(cors({ ... }));
app.use(cookieParser());

// ✅ CSRF above all routes — exempt list handles public paths internally
app.use('/api', csrfMiddleware);

app.use('/api/auth', authRouter);   // login → exempt, logout → protected ✅
app.use(authenticate);
app.use('/api/todos', todoRouter);  // all protected ✅
```

### Frontend — Sending the CSRF Token

```typescript
// Read the CSRF token from the non-HttpOnly cookie
const getCsrfToken = (): string => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrfToken='))
    ?.split('=')[1] || '';
};

// Attach to every state-changing request
fetch('/api/todos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCsrfToken(), // ✅
  },
  body: JSON.stringify({ title: 'New todo' }),
});
```

---

## 9. Project Structure

### Layered Architecture

```
src/
├── app.ts                    # Express app (no server.listen)
├── server.ts                 # Entry point — calls app.listen
├── config/
│   └── index.ts              # All env vars in one place
├── modules/
│   └── auth/
│       ├── auth.router.ts    # Route definitions only
│       ├── auth.controller.ts# Handles req/res, calls services
│       ├── auth.service.ts   # Business logic, no req/res
│       └── auth.schema.ts    # Zod validation schemas
├── shared/
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── csrf.middleware.ts
│   │   └── error.middleware.ts
│   ├── errors/
│   │   └── AppError.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── hash.ts
│   └── lib/
│       └── prisma.ts         # Singleton Prisma client
└── types/
    └── express.d.ts          # req.user type extension
```

### Why This Structure?

Each layer has one clear job:

| Layer | Knows about | Does NOT know about |
|---|---|---|
| Router | URLs, HTTP verbs | Business logic, DB |
| Controller | `req`, `res` | DB queries |
| Service | Business rules | `req`, `res`, HTTP |
| Repository/Prisma | Database | Everything else |

This means each layer can be tested independently and changed without affecting the others.

### Singleton Prisma Client

```typescript
// src/shared/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Never create a `new PrismaClient()` in every file — each instance opens its own connection pool.

---

## 10. Error Handling Middleware

### Custom AppError Class

```typescript
// src/shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Global Error Handler

Express identifies error-handling middleware by its **4-argument signature** `(err, req, res, next)`:

```typescript
// Must be registered LAST — after all routes
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Zod validation errors
  if (err.name === 'ZodError' || err.issues) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors || err.issues,
    });
  }

  // Unknown errors — don't leak details to client
  console.error('Unexpected error:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});
```

### Triggering the Error Handler

Any middleware or route calls `next(error)` to jump straight to the error handler:

```typescript
// In a route handler
try {
  const result = await someService();
  res.json(result);
} catch (error) {
  next(error); // → jumps to global error handler
}

// Or throw AppError — caught by try/catch above
throw new AppError('Not found', 404);
```

---

## 11. Cookie Security

### Cookie Options Explained

```typescript
res.cookie('accessToken', token, {
  httpOnly: true,       // JS cannot read — prevents XSS theft
  secure: true,         // HTTPS only — never sent over HTTP
  sameSite: 'strict',   // Never sent cross-site — CSRF protection
  maxAge: 15 * 60 * 1000, // Must match token expiry (milliseconds)
});
```

### Cookie Comparison

| Option | `accessToken` | `refreshToken` | `csrfToken` |
|---|---|---|---|
| `httpOnly` | `true` | `true` | `false` (JS must read it) |
| `secure` | `true` (prod) | `true` (prod) | `true` (prod) |
| `sameSite` | `strict` | `strict` | `strict` |
| `maxAge` | 15 min | 7 days | 7 days |

### maxAge Must Match Token Expiry

```typescript
// ❌ Mismatch — token expires in 15 min, cookie lives 1 day
const accessToken = generateToken(payload, '15m');
res.cookie('accessToken', accessToken, { maxAge: 24 * 60 * 60 * 1000 });

// ✅ Correct — both expire at the same time
const accessToken = generateToken(payload, '15m');
res.cookie('accessToken', accessToken, { maxAge: 15 * 60 * 1000 });
```

---

## 12. Production Checklist

### Auth Security

- [ ] Access token expiry ≤ 15 minutes
- [ ] Refresh tokens stored in database (not just JWT)
- [ ] Refresh token rotation on every use
- [ ] Reuse detection → invalidate all user sessions
- [ ] Logout clears cookies AND nulls DB refresh token
- [ ] Passwords hashed with bcrypt (never stored plain)
- [ ] Generic error messages for invalid credentials (`'Invalid email or password'` not `'Email not found'`)

### Cookie Security

- [ ] `httpOnly: true` on accessToken and refreshToken
- [ ] `secure: true` in production
- [ ] `sameSite: 'strict'` on all auth cookies
- [ ] `maxAge` matches token expiry exactly
- [ ] Never expose tokens in response body

### CSRF Protection

- [ ] CSRF middleware above all routes
- [ ] `timingSafeEqual` for token comparison (not `===`)
- [ ] CSRF token regenerated on refresh
- [ ] Safe methods (`GET`, `HEAD`, `OPTIONS`) exempt
- [ ] Public routes exempt (login, register)
- [ ] Logout and refresh-token NOT exempt

### TypeScript

- [ ] `express.d.ts` declaration file for `req.user`
- [ ] `tsconfig.json` configured for Node.js (`module: CommonJS`, `moduleResolution: node`)
- [ ] `@types/node` and `@types/express` installed

### Middleware Order in app.ts

```typescript
app.use(express.json());
app.use(cors({ credentials: true, origin: process.env.FRONTEND_URL }));
app.use(cookieParser());
app.use('/api', csrfMiddleware);   // 1. CSRF (exempt list handles public routes)
app.use('/api/auth', authRouter);  // 2. Public auth routes
app.use(authenticate);             // 3. Global auth protection
app.use('/api/...', otherRouters); // 4. Protected routes
app.use(errorHandler);             // 5. Always last
```

---

## Quick Reference

### HTTP Status Codes for Auth

| Status | Meaning | When to use |
|---|---|---|
| `200` | OK | Successful login, logout, refresh |
| `201` | Created | Successful registration |
| `400` | Bad Request | Invalid input, missing fields |
| `401` | Unauthorized | Missing/invalid/expired token |
| `403` | Forbidden | Valid token, insufficient permissions |
| `422` | Unprocessable Entity | Validation errors (Zod) |
| `500` | Internal Server Error | Unexpected errors |

### Common Mistakes

| Mistake | Fix |
|---|---|
| Returning tokens in response body | Use HttpOnly cookies only |
| `maxAge` mismatch between token and cookie | Always match them |
| Using `===` to compare tokens | Use `crypto.timingSafeEqual` |
| Single error message for wrong email vs wrong password | Use same message — prevents user enumeration |
| Using `findFirst` on unique fields | Use `findUnique` — faster and semantically correct |
| Storing all user data in JWT | Store only `userId` and `email` |
| Global auth middleware before login route | Place public routes before global middleware |

---

*Built during a learning session focused on Node.js, Express, TypeScript, and Prisma.*