import { ErrorModel } from '../models/error-model';
import { ErrorCode } from '../exposed/squid';
import { Google } from '../services/google';
import { GoogleAuthHelper } from './google-auth-helper';
import { AuthToken } from './auth-token';
import { TokenType } from './token-type';
import { Identity } from './identity';
import * as express from 'express';
import * as tex from '../core/typed-express'
import * as winston from 'winston';

class GoogleAuth {

    /** Creates a new instance. */
    constructor(private readonly google: Google) { }

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
    public authenticate(req: express.Request): Promise<Identity> {
        return Promise.resolve(null)
            .then(result =>  GoogleAuth.parseAuthHeader(req))
            .then(parsedAuthHeader => {
                winston.debug(`Google ${parsedAuthHeader.tokenType} received. Validating...`);

                switch(parsedAuthHeader.tokenType) {
                    case TokenType.Access:
                        return this.google.getAccessTokenUser(parsedAuthHeader.token);
                    case TokenType.Id:
                        return this.google.getIdTokenUser(parsedAuthHeader.token);
                    default:
                        throw new ErrorModel(ErrorCode.Authorization, 'Unknown Google auth token received');
                }
            });
    }
 
    /**
     * Parses the authentication header in format "<auth header prefix>: <token value>" into a token type and value
     */
    private static parseAuthHeader(req: express.Request): AuthToken {
        // Extract the token and return an error immediately if not found
        let authHeader: string = req.get('Authorization');
        if(!authHeader) {
            winston.warn('AuthZ failed. No token was found');
            throw new ErrorModel(ErrorCode.Authorization, 'Authorization header must be sent with Google token');
        }

        // The auth header has a "<prefix> <token>" format. Parse the token for out for validation. If this fails, bomb out
        let parsedAuth: AuthToken = GoogleAuthHelper.parseAuthToken(authHeader);
        if(!parsedAuth) {
            winston.warn(`AuthZ failed. token or tokenType could not be parsed. Authentication header: ${authHeader}`);
            throw new ErrorModel(ErrorCode.Authorization, 'Unable to parse Authorization header token');
        }

        return parsedAuth;
    }
}

/**
 * Creates a express.RequestHandler that will authorize the request with either a Google ID or access token.
 * 
 * If auth is successful, sets the user identity to req.user. Otherwise, returns a 401 with a detailed error message.
 */
export function googleAuth(google: Google): express.RequestHandler {
    const googleAuth = new GoogleAuth(google);

    return (req: tex.IAuthed, res: express.Response, next: express.NextFunction) => {
        googleAuth.authenticate(req)
            .then((user: Identity) => {
                req.user = user;
                winston.debug('User is authZd');
                next();
            })
            .catch((error: any) => {
                res.status(401).send(error);
            });
    }
}