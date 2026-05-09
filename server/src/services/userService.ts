import { prisma } from "../lib/prisma";

const getByEmail = ({ email }: { email: string }) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const create = (data: { email: string; passwordHash: string }) => {
  return prisma.user.create({
    data,
  });
};

export const userService = {
  getByEmail,
  create,
};
