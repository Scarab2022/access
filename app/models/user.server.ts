import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { prisma } from "~/db.server";

export type { User, Password } from "@prisma/client";
export type Role = "customer" | "admin";

const BCRYPT_ROUNDS = 10;

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

function hashPassword(password: string) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function createUser(
  email: User["email"],
  password: string,
  role: Role
) {
  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      role,
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

export async function resetPassword({
  email,
  token,
  password,
}: {
  email: User["email"];
  token: string;
  password: string;
}) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });
  if (
    !userWithPassword ||
    !userWithPassword.password ||
    !userWithPassword.password.resetPasswordExpireAt ||
    userWithPassword.password.resetPasswordExpireAt.getTime() < Date.now() ||
    !userWithPassword.password.resetPasswordHash ||
    !(await bcrypt.compare(token, userWithPassword.password.resetPasswordHash))
  ) {
    throw new Error("Invalid or expired password reset");
  }

  const hashedPassword = await hashPassword(password);
  return prisma.user.update({
    where: { email },
    data: {
      password: {
        update: { hash: hashedPassword },
      },
    },
  });
}

export async function generatePasswordResetTokenAndHash() {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(token, BCRYPT_ROUNDS);
  return { token, hash };
}

export async function comparePasswordResetTokenAndHash(
  token: string,
  hash: string
) {
  return await bcrypt.compare(token, hash);
}
