import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUsers() {
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

  return { user };
}

async function seedAccessUsers({
  user,
}: Awaited<ReturnType<typeof seedUsers>>) {
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
      description: "Guest1 for Brooklyn BnB",
      code: "111",
      userId: user.id,
    },
  });

  const guest2AccessUser = await prisma.accessUser.create({
    data: {
      name: "Guest2",
      description: "Guest2 for Brooklyn BnB",
      code: "222",
      userId: user.id,
    },
  });

  const guest3AccessUser = await prisma.accessUser.create({
    data: {
      name: "Guest3",
      description: "Guest1 for Staten Island BnB",
      code: "333",
      userId: user.id,
    },
  });

  const guest4AccessUser = await prisma.accessUser.create({
    data: {
      name: "Guest4",
      description: "Guest2 for Brooklyn BnB",
      code: "444",
      userId: user.id,
    },
  });

  return {
    masterAccessUser,
    guest1AccessUser,
    guest2AccessUser,
    guest3AccessUser,
    guest4AccessUser,
  };
}

async function seedAccessHub({
  accessHubId,
  accessHubName,
  accessHubToken,
  user,
  masterAccessUser,
  guest1AccessUser,
  guest2AccessUser,
}: {
  accessHubId: string;
  accessHubName: string;
  accessHubToken: string;
} & Awaited<ReturnType<typeof seedUsers>> &
  Pick<
    Awaited<ReturnType<typeof seedAccessUsers>>,
    "masterAccessUser" | "guest1AccessUser" | "guest2AccessUser"
  >) {
  const accessHub = await prisma.accessHub.create({
    include: {
      accessPoints: true,
      user: {
        include: {
          accessUsers: {
            include: { accessPoints: true },
          },
        },
      },
    },
    data: {
      id: accessHubId,
      name: accessHubName,
      userId: user.id,
      apiToken: {
        create: {
          token: accessHubToken,
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
            name: "Basement Door",
            position: 4,
            accessUsers: {
              connect: [{ id: masterAccessUser.id }],
            },
          },
        ],
      },
    },
  });
  return { accessHub };
}

async function seedAccessHubEvents({
  accessHub,
}: Awaited<ReturnType<typeof seedAccessHub>>) {
  let at = new Date();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of Array(125).keys()) {
    at.setTime(at.getTime() - 90 * 60 * 1000);
    const accessUser =
      accessHub.user.accessUsers[
        Math.floor(Math.random() * accessHub.user.accessUsers.length)
      ];
    const accessPoint =
      accessHub.accessPoints[
        Math.floor(Math.random() * accessHub.accessPoints.length)
      ];
    if (accessUser.accessPoints.some((ap) => ap.id === accessPoint.id)) {
      await prisma.accessEvent.create({
        data: {
          at,
          access: "grant",
          code: accessUser.code,
          accessUserId: accessUser.id,
          accessPointId: accessPoint.id,
        },
      });
    } else {
      await prisma.accessEvent.create({
        data: {
          at,
          access: "deny",
          code: accessUser.code,
          accessPointId: accessPoint.id,
        },
      });
    }
  }
}

async function seed() {
  const { user } = await seedUsers();
  const {
    masterAccessUser,
    guest1AccessUser,
    guest2AccessUser,
    guest3AccessUser,
    guest4AccessUser,
  } = await seedAccessUsers({ user });

  const { accessHub: accessHub1 } = await seedAccessHub({
    accessHubId: "cl2uwi6uv0030ybthbkls5w0i",
    accessHubName: "Brooklyn BnB",
    accessHubToken:
      "d627713660c1891414ac55a6ccd1c1294292bb19a9e6be741f340782a531e331",
    user,
    masterAccessUser,
    guest1AccessUser,
    guest2AccessUser,
  });
  await seedAccessHubEvents({ accessHub: accessHub1 });

  const { accessHub: accessHub2 } = await seedAccessHub({
    accessHubId: "cl2uwi6uv0030ybthbkls5w02",
    accessHubName: "Staten Island BnB",
    accessHubToken:
      "d627713660c1891414ac55a6ccd1c1294292bb19a9e6be741f340782a531e332",
    user,
    masterAccessUser,
    guest1AccessUser: guest3AccessUser,
    guest2AccessUser: guest4AccessUser,
  });
  await seedAccessHubEvents({ accessHub: accessHub2 });

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
