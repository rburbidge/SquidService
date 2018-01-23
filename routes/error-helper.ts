import { ErrorModel } from '../models/error-model';
import { ErrorCode } from '../exposed/squid';
import * as express from 'express';
import * as winston from 'winston';

/**
 * Helpers for sending ErrorModels in Express HTTP responses.
 */
export class ErrorHelper {
    /**
     * Sends an error response. If the error is any, then a generic 500 error model with ErrorCode.Unknown will be sent.
     * @param res The response to send.
     * @param error The error to send.
     * @see ErrorModel
     */
    public static send(res: express.Response, error: any | ErrorModel): void {
        let errorModel: ErrorModel;        
        if(error instanceof ErrorModel) {
            errorModel = error;
        } else {
            winston.warn('An uncaught exception occurred: ' + error);
            errorModel = new ErrorModel(ErrorCode.Unknown, 'Internal server error occurred');
        }

        res.status(ErrorHelper.errorCodeToHttpStatus(errorModel.code)).send(errorModel);
    }

    /**
     * Translates an ErrorCode into a HTTP status code.
     * @returns 500 if the ErrorCode is unknown.
     */
    private static errorCodeToHttpStatus(errorCode: ErrorCode): number {
        switch(errorCode) {
            case ErrorCode.BadRequest:
                return 400;
            case ErrorCode.Authorization:
                return 401;
            case ErrorCode.UserNotFound:
            case ErrorCode.DeviceNotFound:
                return 404;
            case ErrorCode.ServiceConfig:
            case ErrorCode.Unknown:
            default:
                return 500;
        }
    }
}