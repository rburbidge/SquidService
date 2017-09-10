export interface AddDeviceBody {
    /** The device name. */
    name: string;

    /** The device GCM token. */
    gcmToken: string;
}

export interface CommandBody {
    /** The URL to send to the device. */
    url: string
}

/** Device returned by SquidService. */
export interface DeviceModel {
    /** The device unique ID, defined by SquidService. */
    readonly id: string;

    /** The device name displayable in the UI. e.g. "Nexus 5". */
    readonly name: string;
}

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