export default class ErrorModel {
    code: string; // TODO this should be an enum
    message: string;

    constructor(code: string, message: string) {
        this.code = code;
        this.message = message;
    }
}