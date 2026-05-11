import { prisma } from "../lib/prisma";

const getFollowStatus = async ({
  userId,
  friendId,
}: {
  userId: string;
  friendId: string;
}) => {
  const data = await prisma.follow.findMany({
    where: {
      OR: [
        { fromId: userId, toId: friendId },
        { fromId: friendId, toId: userId },
      ],
    },
    // only max 2 will ever be in db
    take: 2,
  });

  return {
    /** if the user is following the friend */
    isUserFollowing: !!data && data.some(({ fromId }) => fromId === userId),
    /** if the friend is following the user */
    isUserFollowed: !!data && data.some(({ fromId }) => fromId === friendId),
  };
};

const create = (data: { fromId: string; toId: string }) => {
  return prisma.follow.create({
    data,
  });
};

const destroy = (data: { fromId: string; toId: string }) => {
  return prisma.follow.delete({
    where: {
      fromId_toId: data,
    },
  });
};

const getAll = ({
  userId,
  getFollowers,
  ...rest
}: {
  userId: string;
  getFollowers: boolean;
  skip: number;
  take: number;
}) => {
  const where = getFollowers
    ? {
        toId: userId,
      }
    : { fromId: userId };

  const select = {
    username: true,
    profileImg: true,
    firstName: true,
    lastName: true,
  };

  const include = getFollowers ? { from: { select } } : { to: { select } };

  return prisma.follow.findMany({
    where,
    ...rest,
    include,
  });
};

const getAllFollowing = (params: {
  userId: string;
  skip: number;
  take: number;
}) => {
  return getAll({
    ...params,
    getFollowers: false,
  });
};

const getAllFollowers = (params: {
  userId: string;
  skip: number;
  take: number;
}) => {
  return getAll({
    ...params,
    getFollowers: true,
  });
};

export const followService = {
  getFollowStatus,
  create,
  destroy,
  getAllFollowing,
  getAllFollowers,
};
