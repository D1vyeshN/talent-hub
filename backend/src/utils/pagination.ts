export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export const getPagination = (query: Record<string, unknown>): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const pageSize = Math.min(100, parseInt(query.pageSize as string) || 10);
  return { page, pageSize };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number
) => ({
  data,
  total,
  page,
  pageSize,
  totalPages: Math.ceil(total / pageSize),
});