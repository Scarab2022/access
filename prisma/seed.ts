import { PrismaClient } from "@prisma/client";
  
const prisma = new PrismaClient();

async function seed() {
  const customerEmail = "scarab2022@gmail.com";
  const admin1Email = "ola.scarab@gmail.com";
  const admin2Email = "mw10013@gmail.com";

  // cleanup the existing database
  // await prisma.user.delete({ where: { email } }).catch(() => {
  //   // no worries if it doesn't exist yet
  // });

  const hashedPassword =
    "$2a$10$xe2ZEEJJqULy6VJ2khSBFeyKWXUWdS0Jkj4SmtsT6ZFOw.fzHdlVa";

  await prisma.user.create({
    data: {
      email: admin1Email,
      role: "admin",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: admin2Email,
      role: "admin",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const user = await prisma.user.create({
    data: {
      email: customerEmail,
      role: "customer",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "My first note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  await prisma.note.create({
    data: {
      title: "My second note",
      body: "Hello, world!",
      userId: user.id,
    },
  });

  const masterAccessUser = await prisma.accessUser.create({
    data: {
      name: "Master",
      description: "Access to everything",
      code: "999",
      userId: user.id,
    },
  });

  const guest1AccessUser = await prisma.accessUser.create({
    data: {
      name: "Guest1",
      description: "Access to everything",
      code: "111",
      userId: user.id,
    },
  });

  const guest2AccessUser = await prisma.accessUser.create({
    data: {
      name: "Guest2",
      description: "Access to everything",
      code: "222",
      userId: user.id,
    },
  });

  await prisma.accessHub.create({
    data: {
      id: "cl2uwi6uv0030ybthbkls5w0i",
      name: "Brooklyn BnB",
      userId: user.id,
      apiToken: {
        create: {
          token:
            "d627713660c1891414ac55a6ccd1c1294292bb19a9e6be741f340782a531e331",
        },
      },
      accessPoints: {
        create: [
          {
            name: "Front Door",
            position: 1,
            accessUsers: {
              connect: [
                { id: masterAccessUser.id },
                { id: guest1AccessUser.id },
                { id: guest2AccessUser.id },
              ],
            },
          },
          {
            name: "First Floor",
            position: 2,
            accessUsers: {
              connect: [
                { id: masterAccessUser.id },
                { id: guest1AccessUser.id },
              ],
            },
          },
          {
            name: "Second Floor",
            position: 3,
            accessUsers: {
              connect: [
                { id: masterAccessUser.id },
                { id: guest1AccessUser.id },
              ],
            },
          },
          {
            name: "Unused",
            position: 4,
          },
        ],
      },
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
