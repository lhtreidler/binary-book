import { prisma } from "../lib/prisma";
import { FormattedBookItems } from "../types/googleApi";

const formatQuery = (query: string) => JSON.stringify(query).toLowerCase();

const getByQuery = ({ query }: { query: string }) => {
  return prisma.searchCache.findFirst({
    where: { query: formatQuery(query) },
  });
};

const create = ({
  query,
  result,
}: {
  query: string;
  result: FormattedBookItems;
}) => {
  return prisma.searchCache.create({
    data: {
      query: formatQuery(query),
      jsonResult: JSON.stringify(result),
    },
  });
};

export const searchCacheService = {
  getByQuery,
  create,
};
