import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ProblemExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProblemExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpError = exception instanceof HttpException;
    const status = isHttpError ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    if (!isHttpError || status >= 500) this.logger.error(exception);
    const errorResponse = isHttpError ? exception.getResponse() : undefined;
    const message =
      typeof errorResponse === 'object' && errorResponse !== null && 'message' in errorResponse
        ? errorResponse.message
        : errorResponse;
    const detail =
      status >= 500
        ? 'An internal server error occurred'
        : Array.isArray(message)
          ? message.join('; ')
          : typeof message === 'string'
            ? message
            : 'Request failed';

    response
      .status(status)
      .type('application/problem+json')
      .json({
        type: 'about:blank',
        title:
          status === 400
            ? 'Bad Request'
            : status === 404
              ? 'Not Found'
              : status >= 500
                ? 'Internal Server Error'
                : 'Request Error',
        status,
        code:
          status === 400
            ? 'BAD_REQUEST'
            : status === 404
              ? 'NOT_FOUND'
              : status >= 500
                ? 'INTERNAL_ERROR'
                : 'HTTP_ERROR',
        detail,
        instance: request.path,
      });
  }
}
