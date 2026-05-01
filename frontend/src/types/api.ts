export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string; code: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;
