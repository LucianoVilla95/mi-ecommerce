interface PaginationMeta {
  total: number,
  currentPage: number,
  lastPage: number
}

 export interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}