import ParsedAuthHeader from './parsed-auth-header';

/**
 * Helper for parsing Google tokens from Authorization header.
 */
export default class GoogleAuthHelper {
    /**
     * Using static properties rather than an enum because the values are also the query string keys.
     */
    public static Access: string = 'access_token';
    public static Id: string = 'id_token';

    /**
     * Map of auth header token prefix to the token type.
     */
    private static tokenPrefixToType: { [key: string]: string} = {
        'Bearer Google OAuth Access Token=': GoogleAuthHelper.Access,
        'Bearer Google OAuth ID Token=': GoogleAuthHelper.Id
    }

    /**
     * Returns parses an auth header.
     * @return The parsed header, or undefined if it could not be parsed.
     */
    public static parseAuthHeader(header: string): ParsedAuthHeader {
        let key: string;
        for(key in GoogleAuthHelper.tokenPrefixToType) {
            if(GoogleAuthHelper.tokenPrefixToType.hasOwnProperty(key)) {
                // If we successfuly parse a token, then stop
                let token: string = GoogleAuthHelper.getStringAfterPrefix(header, key);
                if(token) {
                    return {
                        tokenType: GoogleAuthHelper.tokenPrefixToType[key],
                        token: token
                    }
                }
            }
        }

        return undefined;
    }

    /**
     * If a string begins with a prefix, then returns the remainder of the string. Otherwise, returns undefined.
     */
    private static getStringAfterPrefix(s: string, prefix: string): string {
        if(s.substring(0, prefix.length) == prefix) {
            return s.substring(prefix.length, s.length);
        }
        
        return undefined;
    }
}