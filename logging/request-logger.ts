import * as express from 'express';

/**
 * Logs the basic information about a request.
 * Logs request method, begin/end, and response status code.
 */
export default function (req: express.Request, res: express.Response, next: express.NextFunction) {
    let operation: string = req.method + ' ' + req.baseUrl;
    console.log('Begin ' + operation);

    // Log the request method, path, status code
    let after: Function = () => {
        console.log('End ' + operation + ' ' + res.statusCode);
        console.log('\n');
    };
    res.on('finish', after);
    res.on('close', after);
    next();
}