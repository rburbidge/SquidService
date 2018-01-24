import * as express from 'express';
import * as winston from 'winston';

/**
 * Logs the basic information about a request.
 * Logs request method, begin/end, and response status code.
 */
export function logger(req: express.Request, res: express.Response, next: express.NextFunction) {
    let operation: string = req.method + ' ' + req.originalUrl;
    winston.verbose('Begin ' + operation);

    // Log the request method, path, status code
    let after = () => {
        winston.verbose('End ' + operation + ' ' + res.statusCode);
    };
    res.on('finish', after);
    res.on('close', after);
    next();
}