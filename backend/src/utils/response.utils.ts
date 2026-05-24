export const successResponse = <T>(
  data: T,
  message = 'Success',
  statusCode = 200
) => ({
  success: true,
  statusCode,
  message,
  data,
});

export const errorResponse = (message: string, statusCode = 500) => ({
  success: false,
  statusCode,
  error: message,
});
