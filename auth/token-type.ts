/**
 * The google token type.
 * 
 * Using static properties rather than an enum because the values are also the query string keys.
 */
export class TokenType {
    /**
     * Google access tokens, sent by Chrome extensions.
     */
    public static Access: string = 'access_token';

    /**
     * Google ID tokens, sent by Android applications.
     */
    public static Id: string = 'id_token';
}