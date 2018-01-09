/** High level device type.  */
export enum DeviceType {
    android = "android",
    chrome = "chrome"
}

export interface AddDeviceBody {
    /** The device name. */
    name: string;

    /** The device GCM token. */
    gcmToken: string;

    /** The device type. */
    deviceType: DeviceType;
}

export interface CommandBody {
    /** The URL to send to the device. */
    url: string
}

/** Device returned by SquidService. */
export interface DeviceModel {
    /** The device unique ID, defined by SquidService. */
    id: string;

    /** The device name displayable in the UI. e.g. "Nexus 5". */
    name: string;

    /** The device type. */
    deviceType: DeviceType;
}

/** Error info returned by SquidService. */
export interface ErrorModel {
    /** The error code. */
    code: ErrorCode;

    /**
     * A string representation of the error code. e.g. "UserNotFound"
     * @see code
     */
    codeString: string;

    /** The error message. */
    message: string;

    /** A generic error payload. */
    errorsInfo?: any;
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