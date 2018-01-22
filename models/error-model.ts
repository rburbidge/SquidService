import { ErrorModel as IErrorModel, ErrorCode } from '../exposed/squid';

export class ErrorModel implements IErrorModel {
    /**
     * A string representation of the error code. e.g. "UserNotFound"
     * @see code
     */
    public readonly codeString: string;

    /**
     * Creates an error.
     * @see ErrorModel
     */
    constructor(
        public readonly code: ErrorCode,
        public readonly message: string,
        public readonly errors?: any) {
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
            case ErrorCode.DeviceNotFound:
                return 'Device does not exist';
            default:
                return 'Unknown error occurred';
        }
    }
}