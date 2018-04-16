

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

    /** The user is not signed in. */
    NotSignedIn = 5,

    /** The device to be operated upon was not found. */
    DeviceNotFound = 6,
}

/**
 * The types of auth headers for Squid Service.
 * 
 * See http://stackoverflow.com/questions/8311836/how-to-identify-a-google-oauth2-user/13016081#13016081
 * for details on access vs. ID tokens
 */
export enum AuthHeader {
    /** Google access token type. */
    GoogleOAuthAccessToken = 'Bearer Google OAuth Access Token',

    /** Google ID token type. */
    GoogleOAuthIdToken = 'Bearer Google OAuth ID Token'
}

/** Creates the value of an auth header. */
export function createAuthHeader(headerType: AuthHeader, authToken: string) {
    return headerType + "=" + authToken;
}

/**
 * The type of a SquidMessage.
 */
type MessageType =
/** An iframe is requesting for its height to be set. */
'heightChanged';

/**
 * The type of MessageEvent.data that can be published by on a Squid page.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 */
export interface SquidMessage {
    type: MessageType;
    data: any;
}