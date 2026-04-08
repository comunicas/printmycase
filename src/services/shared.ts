export type ServiceErrorCode =
  | "UNKNOWN"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION"
  | "NETWORK"
  | "DATABASE"
  | "STORAGE"
  | "FUNCTION";

export type ServiceError = {
  code: ServiceErrorCode;
  message: string;
  cause?: unknown;
};

export type ServiceResult<T> = {
  data: T | null;
  error: ServiceError | null;
};

export const ok = <T>(data: T): ServiceResult<T> => ({ data, error: null });

export const fail = <T = never>(error: ServiceError): ServiceResult<T> => ({ data: null, error });
