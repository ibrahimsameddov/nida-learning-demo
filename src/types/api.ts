export interface AuthResponse {
  token:          string;
  uniqueId:       string;
  fullName:       string;
  role:           string;
  emailVerified:  boolean;
  gradeLevel?:    string;
  specialtyGroup?: string;
}

export interface ApiError {
  message:  string;
  errors?:  Record<string, string>;
  status?:  number;
}

export interface PaginatedResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  page:          number;
  size:          number;
}

export interface TestStartResponse {
  sessionId: string;
}

export interface TestFinishResponse {
  score:        number;
  total:        number;
  percent:      number;
  message:      string;
  subjectStats: any[];
}

export interface BalanceResponse {
  balance: number;
}
