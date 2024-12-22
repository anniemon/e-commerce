import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionsFilter {
  private readonly logger: Logger = new Logger('ExceptionsFilter');

  public catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let response: string | object = {
      statusCode: status,
      message: 'Internal server error',
    };
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      response = exception.getResponse();
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `Http status: ${status} Error Response: ${JSON.stringify(response)}`,
      );
    } else {
      this.logger.warn(
        `Http status: ${status} Error Response: ${JSON.stringify(response)}`,
      );
    }

    res.status(status).json(response);
  }
}
