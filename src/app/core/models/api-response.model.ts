export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  timestamp?: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
  timestamp?: string;
  path?: string;
}
