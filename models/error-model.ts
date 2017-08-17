export class ErrorModel {
    code: string; // TODO this should be an enum
    message: string;
    errors: any

    constructor(code: string, message: string, errors?: ExpressValidator.MappedError[]) {
        this.code = code;
        this.message = message;
        this.errors = errors;
    }
}