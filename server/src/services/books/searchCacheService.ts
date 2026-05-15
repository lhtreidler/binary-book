import { prisma } from "../../lib/prisma";
import { FormattedBookItems } from "../../types/googleApi";

const formatQuery = (query: string) => JSON.stringify(query).toLowerCase();

const getByQuery = async ({ query }: { query: string }) => {
  const result = await prisma.searchCache.findFirst({
    where: { query: formatQuery(query) },
  });

  if (!result) return null;

  return {
    ...result,
    jsonResult: result.jsonResult as FormattedBookItems,
  };
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
      jsonResult: result,
    },
  });
};

export const searchCacheService = {
  getByQuery,
  create,
};
