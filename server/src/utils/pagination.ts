const PAGE_SIZE = 10;

const getPaginationParams = (page = 1) => {
  const skip = (page - 1) * PAGE_SIZE;

  return {
    skip,
    take: PAGE_SIZE + 1,
  };
};

export const handlePaginatedRequest = async <T>({
  page = 1,
  callback,
}: {
  page?: number;
  callback: (p: ReturnType<typeof getPaginationParams>) => Promise<T[]>;
}) => {
  const paginationParams = getPaginationParams(page);
  const result = await callback(paginationParams);
  return {
    result: result.slice(0, paginationParams.take - 1),
    nextPage: result.length === paginationParams.take ? page + 1 : null,
  };
};
