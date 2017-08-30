import { TokenType } from './token-type';
import { AuthToken } from './auth-token';

/**
 * Helper for parsing Google tokens from Authorization header.
 */
export class GoogleAuthHelper {
    /**
     * Map of auth header token prefix to the token type.
     */
    private static tokenPrefixToType: { [key: string]: string} = {
        'Bearer Google OAuth Access Token=': TokenType.Access,
        'Bearer Google OAuth ID Token=': TokenType.Id
    }

    /**
     * Returns parses an auth token from an Authorization header.
     * @return The parsed token, or undefined if it could not be parsed.
     */
    public static parseAuthToken(header: string): AuthToken {
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