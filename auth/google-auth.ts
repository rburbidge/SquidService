import { Google } from '../services/google';
import GoogleAuthHelper from './google-auth-helper';
import { AuthToken } from './auth-token';
import { TokenType } from './token-type';
import { User } from './user';
import * as express from 'express';
import * as tex from '../core/typed-express'

class GoogleAuth {
    /**
     * Authenticate a request.
     * 
     * Two types of tokens are received by the service:
     * * Google ID tokens, sent by the Android app.
     * * Google access tokens, sent by the chrome extension.
     * 
     * ID tokens contain the user ID.
     * Access tokens do not contain the user ID, but we obtain it by making a call to Google getUserInfo.
     * @returns a user if the request has AuthZ, and throws otherwise.
     */
    public static authenticate(req: express.Request): Promise<User> {
        const parsedAuthHeader = GoogleAuth.parseAuthHeader(req);
        
        console.log(`Google ${parsedAuthHeader.tokenType} received. Validating...`);

        return Google.getTokenInfo(parsedAuthHeader.tokenType, parsedAuthHeader.token)
            // 1. Get the token info for either access token or ID token
            //    If this succeeds, then we have AuthZ
            .then((tokenInfo) => {
                if(!tokenInfo) {
                    console.error('AuthZ failed. Unable to obtain identity');
                    throw new Error('Authorization did not return a user');
                }

                console.log('Token is valid');
                return tokenInfo;
            })
            // 2. Get the User identity
            //    If ID token, then we already have the User object -- return it
            //    If access token, then we need to call getUserInfo to get the user
            .then((user) => {
                switch(parsedAuthHeader.tokenType) {
                    case TokenType.Id:
                        return Promise.resolve(user);
                    case TokenType.Access:
                        console.log('Getting user ID for access_token');
                        return Google.getUserInfo(parsedAuthHeader.token);
                }
            });
    }
 
    /**
     * Parses the authentication header in format <auth header prefix>: <token value> into a token type and value
     */
    private static parseAuthHeader(req: express.Request): AuthToken {
        // Extract the token and return an error immediately if not found
        let authHeader: string = req.get('Authorization');
        if(!authHeader) {
            console.error('AuthZ failed. No token was found');
            throw new Error('Authorization header must be sent with Google token');
        }

        // The auth header has a "<prefix> <token>" format. Parse the token for out for validation. If this fails, bomb out
        let parsedAuth: AuthToken = GoogleAuthHelper.parseAuthToken(authHeader);
        if(!parsedAuth) {
            console.error(`AuthZ failed. token or tokenType could not be parsed ${authHeader}`);
            throw new Error('Unable to parse Authorization header token');
        }

        return parsedAuth;
    }
}

/**
 * Authenticates the a request, expecting with either a Google ID token or access token.
 * 
 * If auth is successful, adds the user identity to req.user. Otherwise, returns a 401 with a detailed error message.
 */
export default function(req: tex.IAuthed, res: express.Response, next: express.NextFunction) {
    GoogleAuth.authenticate(req)
        .then((user: User) => {
            req.user = user;
            console.log('User is authZd');
            next();
        })
        .catch((error: any) => {
            res.status(401).send(error);
        })
}