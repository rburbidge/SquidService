import { ErrorModel, ErrorCode } from '../models/error-model';

import * as express from 'express';

/**
 * Executes a validation function to be applied to a method.
 * 
 * The caller should add their necessary express-validator checks, e.g.
 * 
 * @Validate(
 *      function validatePostApi(req: express.Request, res: express.Response) {
 *          req.checkBody('name', 'Must pass name').notEmpty();
 *          req.checkBody('id', 'Must pass id').notEmpty();
 *      })
 * function functionToBeValidated(req: express.Reqyest, res: express.Response) {
 *      // Handle request
 * }
 * 
 * If validation succeeds, then functionToBeValidated() will be called.
 * If validation fails, then a 404 response will be sent and functionToBeValidated() will not be called.
 * @param validate The validation function.
 */
export function Validate(validate: IValidator) {
    if(!validate) {
        throw 'Call Validate() with a validation function';
    }

    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = function(req: express.Request, res: express.Response) {
            validate(req, res);

            const errors = req.validationErrors();
            if (errors) {
                res.status(400).send(new ErrorModel(
                    ErrorCode.BadRequest, 'Malformed request', errors as ExpressValidator.MappedError[]));
                return;
            }

            originalMethod.apply(this, arguments)
        };
    };
}

/**
 * Interface for request validation fucntion.
 */
interface IValidator {
     (req: express.Request, res: express.Response): void
}
