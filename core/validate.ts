import { ErrorModel } from '../models/error-model';
import { ErrorCode } from '../exposed/squid';

import * as express from 'express';
import * as expressValidator from 'express-validator';

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

            const args = arguments;

            req.getValidationResult()
                .then(result => {
                    if(result.isEmpty()) {
                        originalMethod.apply(this, args);
                    } else {
                        const firstError = result.array({onlyFirstError: true})[0];
                        let errorMessage = firstError.value
                            ? `Invalid ${firstError.param}. ${firstError.msg}`
                            : `Must pass ${firstError.param} in ${firstError.location}`
                        res.status(400).send(new ErrorModel(ErrorCode.BadRequest, 'Malformed request: ' + errorMessage));        
                    }
                });
        };
    };
}

/**
 * Interface for request validation fucntion.
 */
interface IValidator {
     (req: express.Request, res: express.Response): void
}
