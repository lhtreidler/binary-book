import { User } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { formatEmail, formatUsername } from "../../utils/format";
import { OmitSystem, WithOptional } from "../../utils/type-utils";
import { followService } from "./followService";

type BaseUser = OmitSystem<User>;

type CreateUser = WithOptional<BaseUser, "firstName" | "lastName" | "username">;

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

  return existingCount > 0;
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

const getUserById = ({ id }: { id: string }) => {
  return prisma.user.findFirst({ where: { id } });
};

const getUserAndFollowDetails = async ({
  userId,
  friendId,
}: {
  userId: string;
  friendId?: string;
}) => {
  const userIdToGet = friendId || userId;

  const [userData, followData] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userIdToGet },
      include: {
        _count: {
          select: {
            followers: true,
            followings: true,
            rankings: true,
          },
        },
      },
    }),
    ...(friendId ? [followService.getFollowStatus({ userId, friendId })] : []),
  ]);

  if (!userData) {
    return null;
  }

  const {
    _count: { followers: followerCount, followings: followingCount },
    firstName,
    username,
    profileImg,
    createdAt,
    lastName,
  } = userData;

  return {
    firstName,
    lastName,
    username,
    profileImg,
    createdAt,
    followerCount,
    followingCount,
    ...(followData || {}),
  };
};

const getByUsername = ({ username }: { username: string }) => {
  return prisma.user.findUnique({
    where: { username: formatUsername(username) },
    omit: {
      passwordHash: true,
    },
  });
};

const searchByUsername = ({ username }: { username: string }) => {
  return prisma.user.findMany({
    orderBy: {
      _relevance: {
        fields: ["username"],
        search: formatUsername(username),
        sort: "desc",
      },
    },
    take: 20,
    select: {
      username: true,
      firstName: true,
      lastName: true,
      profileImg: true,
      id: true,
    },
  });
};

const update = ({
  data,
  id,
}: {
  id: string;
  data: Partial<
    Pick<User, "firstName" | "lastName" | "username" | "profileImg">
  >;
}) => {
  return prisma.user.update({ data, where: { id } });
};

export const userService = {
  getByEmail,
  getByUsername,
  create,
  getIsUniqueOrThrow,
  getIsEmailTaken,
  getIsUsernameTaken,
  getUserById,
  update,
  searchByUsername,
  getUserAndFollowDetails,
};
