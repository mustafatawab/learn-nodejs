### Folder Structure

```
src
│
├── app.ts
├── server.ts
│
├── config
│
├── database
│
├── infrastructure
│
├── shared
│   ├── middleware
│   ├── errors
│   ├── constants
│   ├── utils
│   ├── logger
│   └── validators
│
├── modules
│   ├── auth
│   │
│   ├── user
│   │   ├── user.route.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── user.schema.ts
│   │   ├── user.model.ts
│   │   ├── user.interface.ts
│   │   └── user.validation.ts
│   │
│   ├── organization
│   ├── project
│   ├── task
│   ├── role
│   └── permission
│
├── types
│
└── tests


```

### Step 1: Install Dependencies

```
npm install express mongoose dotenv cors helmet zod

npm install -D typescript ts-node-dev @types/node @types/express
```

Initialize TypeScript:

```
npx tsc --init
```

### Step 2: Database Connection

> src/database/mongodb.ts

```
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

```

### Step 3: Environment Variables

> .env

```
PORT=5000

MONGO_URI=mongodb://localhost:27017/node_crud
```

### Step 4: `server.ts`

```
import app from "./app";
import { connectDB } from "./database/mongodb";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
};

startServer();
```

### Step 5: `app.ts`

```
import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

export default app;
```


### Step 6: User Interface
Create
> modules/user/user.interface.ts

```
export interface IUser {
  name: string;
  email: string;
  age: number;
}
```

### Step 7: User Model
Create: 
> modules/user/user.model.ts

```
import mongoose from "mongoose";
import { IUser } from "./user.interface";

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    age: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
```


### Step 8: Repository Layer
create
> user.repository.ts

```
import { UserModel } from "./user.model";
import { IUser } from "./user.interface";

export const createUserRepository = async (
  payload: IUser
) => {
  return UserModel.create(payload);
};

export const getAllUsersRepository = async () => {
  return UserModel.find();
};

export const getUserByIdRepository = async (
  id: string
) => {
  return UserModel.findById(id);
};

export const updateUserRepository = async (
  id: string,
  payload: Partial<IUser>
) => {
  return UserModel.findByIdAndUpdate(
    id,
    payload,
    {
      new: true
    }
  );
};

export const deleteUserRepository = async (
  id: string
) => {
  return UserModel.findByIdAndDelete(id);
};

```


### Step 9: Service Layer
Business Logic goes here

```
import * as userRepository from "./user.repository";
import { IUser } from "./user.interface";

export const createUserService = async (
  payload: IUser
) => {
  return userRepository.createUserRepository(payload);
};

export const getAllUsersService = async () => {
  return userRepository.getAllUsersRepository();
};

export const getUserByIdService = async (
  id: string
) => {
  return userRepository.getUserByIdRepository(id);
};

export const updateUserService = async (
  id: string,
  payload: Partial<IUser>
) => {
  return userRepository.updateUserRepository(
    id,
    payload
  );
};

export const deleteUserService = async (
  id: string
) => {
  return userRepository.deleteUserRepository(id);
};
```



### Step 10: Controller Layer
```
import { Request, Response } from "express";
import * as userService from "./user.service";

export const createUserController = async (
  req: Request,
  res: Response
) => {
  const user =
    await userService.createUserService(req.body);

  res.status(201).json(user);
};

export const getAllUsersController = async (
  req: Request,
  res: Response
) => {
  const users =
    await userService.getAllUsersService();

  res.json(users);
};

export const getUserByIdController = async (
  req: Request,
  res: Response
) => {
  const user =
    await userService.getUserByIdService(
      req.params.id
    );

  res.json(user);
};

export const updateUserController = async (
  req: Request,
  res: Response
) => {
  const user =
    await userService.updateUserService(
      req.params.id,
      req.body
    );

  res.json(user);
};

export const deleteUserController = async (
  req: Request,
  res: Response
) => {
  await userService.deleteUserService(
    req.params.id
  );

  res.json({
    message: "Deleted successfully"
  });
};
```


### Step 11: Routes

```
import { Router } from "express";
import * as userController from "./user.controller";

const router = Router();

router.post("/", userController.createUserController);

router.get("/", userController.getAllUsersController);

router.get("/:id", userController.getUserByIdController);

router.patch("/:id", userController.updateUserController);

router.delete("/:id", userController.deleteUserController);

export default router;
```


### Step 12: Mount Route
inside `app.ts`

```
import userRouter from "./modules/user/user.route";

app.use("/api/users", userRouter);

```