export class ErrorModel {
    /** A string representation of the error code that was passed in. */
    public readonly codeString: string;

    /**
     * Creates an error.
     * @param code The error code.
     * @param message The error message.
     * @param errors The set of errors that makes up this error.
     */
    constructor(
        public readonly code: ErrorCode,
        public readonly message: string,
        public readonly errors?: ExpressValidator.MappedError[]) {
        this.codeString = ErrorCode[code];
    }
}

/**
 * Defines the general type of error.
 * 
 * !! Do not change the numeric assignments !!
 */
export enum ErrorCode {
    /** An unknown error occurred. */
    Unknown = 0,

    /** The user sent an invalid request. */
    BadRequest = 1,

    /** The user to be operated upon was not found. */
    UserNotFound = 2
}