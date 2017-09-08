export class ErrorModel {
    /**
     * A string representation of the error code. e.g. "UserNotFound"
     * @see code
     */
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

    public toString(): string {
        return JSON.stringify(this);
    }

    /** Creates a generic ErrorModel from an error code. */
    public static fromErrorCode(errorCode: ErrorCode): ErrorModel {
        return new ErrorModel(errorCode, ErrorModel.getErrorMessage(errorCode));
    }

    /** Gets the generic error message for an error code. */
    private static getErrorMessage(errorCode: ErrorCode): string{
        switch(errorCode) {
            case ErrorCode.UserNotFound:
                return 'User does not exist';       
            default:
                return 'Unknown error occurred';
        }
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

    /** The service was not configured correctly. */
    ServiceConfig = 1,

    /** The request could not be authorized. */
    Authorization = 2,

    /** The user sent an invalid request. */
    BadRequest = 3,

    /** The user to be operated upon was not found. */
    UserNotFound = 4,
}