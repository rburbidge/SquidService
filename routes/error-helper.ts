import { ErrorModel, ErrorCode } from '../models/error-model';
import * as express from 'express';

export class ErrorHelper {
    /**
     * Sends an error response. If the error is any, then a generic 500 error with ErrorCode.Unknown will be sent.
     * @param res The response to send.
     * @param error The error to send.
     */
    public static send(res: express.Response, error: any | ErrorModel): void {
        let errorModel: ErrorModel;        
        if(error instanceof ErrorModel) {
            errorModel = error;
        } else {
            console.log('An uncaught exception occurred: ' + error);
            errorModel = new ErrorModel(ErrorCode.Unknown, 'Internal server error occurred');
        }

        res.status(ErrorHelper.errorCodeToHttpStatus(errorModel.code)).send(error);
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
                return 404;
            case ErrorCode.ServiceConfig:
            case ErrorCode.Unknown:
            default:
                return 500;
        }
    }
}