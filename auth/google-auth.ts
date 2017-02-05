import Google from '../services/google';
import GoogleAuthHelper from './google-auth-helper';
import ParsedAuthHeader from './parsed-auth-header';
import * as express from 'express';

export default class GoogleAuth {
    public static auth(req: express.Request, res: express.Response, next: express.NextFunction) {
        // Extract the token and return an error immediately if not found
        let authHeader: string = req.get('Authorization');
        if(!authHeader) {
            console.error('AuthZ failed. No token was found');
            res.status(401).send('Authorization header must be sent with Google token');
            return;
        }

        // If parsing failed, bomb out
        let parsedAuth: ParsedAuthHeader = GoogleAuthHelper.parseAuthHeader(authHeader);
        if(!parsedAuth) {
            console.error(`AuthZ failed. token or tokenType could not be parsed ${authHeader}`);
            res.status(401).send('Unable to parse Authorization header token');
            return;   
        }

        console.log(`Google ${parsedAuth.tokenType} received. Validating...`);

        // Get the user info inside the token. If this succeeds, we have auth Z
        Google.getTokenInfo(parsedAuth.tokenType, parsedAuth.token)
            .then((user) => {
                if(!user) {
                    console.error('AuthZ failed. Unable to obtain identity. user is falsy');
                    res.status(401).send('Authorization did not return a user');
                    return;
                }

                console.log('Token is valid');

                // If using id_token, account ID is returned in the response
                if(parsedAuth.tokenType === GoogleAuthHelper.Id) {
                    (req as any).user = user.sub;
                    console.log('User is authZd');
                    next();
                    return;
                }

                // For access_token, must call getUserInfo() to retrieve the ID
                console.log('Getting user ID for access_token');
                Google.getUserInfo(parsedAuth.token)
                    .then((user) => {
                        (req as any).user = user.sub;
                        console.log('Google ID retrieved');
                        console.log('User is authZd');
                        next();
                    })
                    .catch((error) => {
                        console.error('AuthZ failed. google.getTokenInfo() returned error=' + error);
                        res.status(401).send('Authorization header was invalid').end();
                    });
            })
            .catch((error) => {
                console.error('AuthZ failed. google.getTokenInfo() returned error=' + error);
                res.status(401).send('Authorization header was invalid').end();
            });
    }
}