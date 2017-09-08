/** Error info returned by SquidService. */
export interface ErrorModel {
    /** The error code. */
    readonly code: ErrorCode;

    /**
     * A string representation of the error code. e.g. "UserNotFound"
     * @see code
     */
    readonly codeString: string;

    /** The error message. */
    readonly message: string;

    /** A generic error payload. */
    readonly errorsInfo?: any;
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