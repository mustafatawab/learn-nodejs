import { prisma } from "../src/shared/lib/prisma";

async function main() {
  console.log("Seeding database...");

//   let users = await prisma.user.createMany({
//     data: [
//       {
//         email: "user1@gmail.com",
//         gender: "Male",
//         name: "User 1",
//         password: "password1",
//       },

//       {
//         email: "user2@gmail.com",
//         gender: "Female",
//         name: "User 2",
//         password: "password2",
//       },
//     ],
//   });

//   let user1 = await prisma.user.findUnique({
//     where: { email: "user1@gmail.com" },
//   });

//   let user2 = await prisma.user.findUnique({
//     where: { email: "user2@gmail.com" },
//   });


let user1 = await prisma.user.create({
    data : {
        email: "user1@gmail.com",
        name : "User 1",
        gender : "Male",
        password : "password1"
    }
})

let user2 = await prisma.user.create({
    data : {
        email: "user2@gmail.com",
        name : "User 2",
        gender : "Female",
        password : "password2"
    }
})

  let todoCount = await prisma.todo.count();

  if (todoCount > 0) {
    console.log("Database already seeded. Skipping seeding.");
    return;
  }

  let todos = await prisma.todo.createMany({
    data: [
      {
        userId: user1?.id,
        title: "Learn Node.js",
        description:
          "Learn the basics of Node.js and how to build backend applications.",
        completed: false,
      },
      {
        userId: user2?.id,
        title: "Learn Express.js",
        description:
          "Learn how to use Express.js to build web applications and APIs.",
        completed: false,
      },
      {
        userId: user2?.id,
        title: "Learn Prisma",
        description: "Learn how to use Prisma as an ORM for database access.",
        completed: false,
      },
    ],
  });

  console.log("\n Todos Seeded : " + todos.count);
  console.log("\n Todos are \n ", todos);
}



main().then(() => {
  console.log("Seeding completed.");
  process.exit(0);
}).catch((error) => {
  console.error("Error seeding database", error);
  process.exit(1);
})