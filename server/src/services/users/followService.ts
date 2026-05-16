import {
  FollowFindManyArgs,
  FollowGroupByArgs,
} from "../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import _ from "lodash";

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

type GetAllParams = {
  /** The authenticated user — used to compute isFollowedByYou / isFollowingYou */
  viewerId: string;
  skip: number;
  take: number;
};

const buildUserSelect = (viewerId: string) => ({
  id: true,
  username: true,
  profileImg: true,
  firstName: true,
  lastName: true,
  _count: {
    select: {
      followings: { where: { toId: viewerId } },
      followers: { where: { fromId: viewerId } },
    },
  },
});

/** Returns the users that `from` follows */
const getAllFollowing = async ({
  from,
  viewerId,
}: GetAllParams & { from: string }) => {
  const result = await prisma.follow.findMany({
    where: { fromId: from },
    include: { to: { select: buildUserSelect(viewerId) } },
  });

  return result.map(({ to: { _count, ...user } }) => ({
    isFollowingYou: !!_count.followings,
    isFollowedByYou: !!_count.followers,
    ...user,
  }));
};

/** Returns the users that follow `to` */
const getAllFollowers = async ({
  to,
  viewerId,
}: GetAllParams & { to: string }) => {
  const result = await prisma.follow.findMany({
    where: { toId: to },
    include: { from: { select: buildUserSelect(viewerId) } },
  });

  return result.map(({ from: { _count, ...user } }) => ({
    isFollowingYou: !!_count.followings,
    isFollowedByYou: !!_count.followers,
    ...user,
  }));
};

const getRecommended = async ({
  userId,
  ...params
}: { userId: string } & Pick<FollowGroupByArgs, "skip" | "take">) => {
  const following = await prisma.follow.findMany({
    where: { fromId: userId },
    select: { toId: true },
  });
  const followingIds = following.map((f) => f.toId);

  const recommendedUsers = await prisma.follow.groupBy({
    by: ["toId"],
    where: {
      fromId: { in: followingIds },
      toId: { notIn: [...followingIds, userId] },
    },
    _count: { toId: true },
    orderBy: { _count: { toId: "desc" } },
    take: 10,
    ...params,
  });

  const countMap: Record<string, number> = {};
  const idsToGet: string[] = [];

  for (const { _count, toId } of recommendedUsers) {
    countMap[toId] = _count.toId;
    idsToGet.push(toId);
  }

  const users = await prisma.user.findMany({
    where: { id: { in: idsToGet } },
    select: {
      id: true,
      username: true,
      profileImg: true,
      firstName: true,
      lastName: true,
    },
  });

  return users
    .map((user) => {
      return {
        ...user,
        mutualFollowers: countMap[user.id],
      };
    })
    .sort((a, b) => b.mutualFollowers - a.mutualFollowers);
};

export const followService = {
  getFollowStatus,
  create,
  destroy,
  getAllFollowing,
  getAllFollowers,
  getRecommended,
};
