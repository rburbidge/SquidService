export class TokenType {
    /**
     * Using static properties rather than an enum because the values are also the query string keys.
     */
    public static Access: string = 'access_token';
    public static Id: string = 'id_token';
}