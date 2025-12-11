import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  total: number;
  pages: number;
  currentPage: number;
  data: T[];
}

export interface QueryParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}