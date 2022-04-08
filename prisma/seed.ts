import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";
  const adminEmail = "admin@access.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });
  await prisma.user.delete({ where: { email: adminEmail } }).catch(() => {});

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  await prisma.user.create({
    data: {
      email: "admin@access.com",
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
      email,
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
      name: "Brooklyn BnB",
      userId: user.id,
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
