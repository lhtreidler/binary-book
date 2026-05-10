import { User } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { formatEmail, formatUsername } from "../utils/format";
import { OmitSystem, WithOptional } from "../utils/type-utils";

type BaseUser = OmitSystem<User>;

type CreateUser = WithOptional<BaseUser, "firstName" | "lastName">;

const getByEmail = ({ email }: { email: string }) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const create = (data: CreateUser) => {
  return prisma.user.create({
    data,
  });
};

const getIsEmailTaken = async (data: { email: string }) => {
  const existingCount = await prisma.user.count({
    where: { email: formatEmail(data.email) },
  });

  return existingCount === 0;
};

const getIsUsernameTaken = async (data: { username: string }) => {
  const existingCount = await prisma.user.count({
    where: { username: formatUsername(data.username) },
  });

  return existingCount === 0;
};

const getIsUniqueOrThrow = async (data: {
  username: string;
  email: string;
}) => {
  const email = formatEmail(data.email);
  const username = formatUsername(data.username);
  const [usernameUserCount, emailUserCount] = await Promise.all(
    [{ username }, { email }].map((where) => prisma.user.count({ where })),
  );

  if (usernameUserCount > 0 || emailUserCount > 0) {
    throw new Error(
      usernameUserCount > 0 ? "Username is not unique" : "Email is not unique",
    );
  }
};

export const userService = {
  getByEmail,
  create,
  getIsUniqueOrThrow,
  getIsEmailTaken,
  getIsUsernameTaken,
};
