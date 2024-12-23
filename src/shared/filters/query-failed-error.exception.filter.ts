import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { ConstraintErrors } from '../errors';

@Catch(QueryFailedError)
export class QueryFailedExceptionFilter implements ExceptionFilter {
    constructor(public reflector: Reflector) {}

    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse<Response>();

        const constraint = ConstraintErrors[exception.constraint];

        const status = exception.constraint && exception.constraint.startsWith('UQ') ? HttpStatus.CONFLICT : HttpStatus.INTERNAL_SERVER_ERROR;

        Logger.error(exception);

        response.status(status).json({
            errorCode: 'NOT_SPECIFIED',
            statusCode: status,
            message: constraint?.message || exception.message,
            errors: null,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
