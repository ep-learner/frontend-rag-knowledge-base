export interface ApiResponse<T = any> {
  code: number
  data: T | null
  message: string
}

export function success<T>(data: T, message = 'ok'): ApiResponse<T> {
  return {
    code: 0,
    data,
    message,
  }
}

export function error(code: number, message: string, data: any = null): ApiResponse {
  return {
    code,
    data,
    message,
  }
}

export enum ErrorCode {
  BAD_REQUEST = 40001,
  UNAUTHORIZED = 40101,
  FORBIDDEN = 40301,
  NOT_FOUND = 40401,
  INTERNAL_ERROR = 50001,
  SERVICE_UNAVAILABLE = 50301,
}
