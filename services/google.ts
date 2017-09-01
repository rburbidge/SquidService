import { ErrorModel, ErrorCode } from '../models/error-model'
import { User } from '../auth/user';
import { TokenType } from '../auth/token-type';

const axios = require('axios');

/** Contains helpers to access Google services. */
export class Google {

    /**
     * Creates a new instance.
     * @param apiKey The API key used to send GCM messages.
     * @param clientIds The whitelist of valid Google client IDs.
     */
    constructor(private readonly apiKey: string, private readonly clientIds: Array<string>) { }

    /**
     * Gets ID token info.
     * @param token The ID token.
     */
    public getIdTokenUser(token: string): Promise<User> {
        return this.getTokenInfoImpl(TokenType.Id, token)
            .then((body: IGoogleIdToken) => {
                return User.fromIdToken(body);
            })
            .catch((error) => {
                throw new ErrorModel(ErrorCode.Authorization, 'Error validating Google token: ' + JSON.stringify(error));
            });
    }

    /**
     * Gets access token info.
     * @param token The access token.
     */
    public getAccessTokenUser(token: string): Promise<User> {
        return this.getTokenInfoImpl(TokenType.Access, token)
            .then(() => {
                return Google.getUserInfo(token);
            })
            .catch((error) => {
                throw new ErrorModel(ErrorCode.Authorization, 'Error validating Google token: ' + JSON.stringify(error));
            });
    }

    /**
     * Sends the payload data to a device with GCM registration token.
     */
    public sendGcmMessage(data: IMessage, gcmToken: string): Promise<void> {
        return axios(
            {
                method: 'post',
                url: 'https://gcm-http.googleapis.com/gcm/send',
                headers: {
                    'Authorization': 'key=' + this.apiKey,
                    'Content-Type': 'application/json'
                },
                data: {
                    data: data,
                    to: gcmToken
                }
            })
            .then(response => {
                if(response.status != 200) throw new ErrorModel(ErrorCode.Unknown,
                    `GCM message could not be sent. status=${response.status}, body=${response.data}`);
            })
            .catch(error => {
                throw error;
            });
    }

    /**
     * Get token info for any token type.
     * * In the case of ID tokens, this returns IGoogleIdToken.
     * * In the case if access tokens, we don't care about the return type because we still need to call
     *   Google.getUserInfo() to get the unique user ID.
     * @param tokenType One of the TokenType values.
     * @param token The token.
     */
    private getTokenInfoImpl(tokenType: string, token: string): Promise<any> {
        return axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?${tokenType}=${token}`)
            .then(response => {
                const body: IGoogleToken = response.data;

                // Verify that token client ID matches whitelist of client IDs
                if(!this.clientIds) throw new ErrorModel(ErrorCode.ServiceConfig, 'Google clientIds is null');                
                if(this.clientIds.indexOf(body.aud) == -1) throw new ErrorModel(
                    ErrorCode.Authorization, 'Google token had invalid client ID in aud field:' + body.aud);

                return body;
            })
            .catch((error) => {
                throw new ErrorModel(ErrorCode.Authorization, 'Error validating Google token: ' + JSON.stringify(error));
            });
    }

    /**
     * Retrieves the user info for an access token.
     * 
     * Required because access tokens do not contain the user info, such as the user's unique ID.
     * @param accessToken The access token.
     */
    private static getUserInfo(accessToken: string): Promise<User> {
        return axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`)
            .then(response => {
                if(response.status != 200) throw new ErrorModel(
                    ErrorCode.Authorization, 'response.statusCode=' + response.statusCode + ', body=' + response.data);
                
                return User.fromUserInfo(response.data);
            });
    }
}

interface IGoogleToken {
    /** The token's Google client ID. */
    aud: string;
}

/**
 * TODO Get URL for dev guide for this API.
 */
export interface IGoogleIdToken extends IGoogleToken {
    /** The user name. */
    name?: string;

    /** The user profile picture. */
    picture?: string;

    /**
     * The unique identity of the user.
     * From https://developers.google.com/identity/protocols/OpenIDConnect
     * An identifier for the user, unique among all Google accounts and never reused. A Google account can have multiple emails at different points in time, but the sub value is never changed. Use sub within your application as the unique-identifier key for the user.
     */
    sub: string;
}

/**
 * TODO Get URL for dev guide for this API.
 */
export interface IGoogleUserInfo extends IGoogleIdToken {
    /** The user email. */
    email?: string;

    /** The user gender. */
    gender?: string;
}

/**
 * A message to be sent to a device through GCM.
 */
export interface IMessage {
    /**
     * The type of message being sent. One of the MessageType values.
     */
    type: string,

    /**
     * The data being sent. e.g. a URL.
     */
    data: string
}

export class MessageType {
    public static readonly Url = 'Url';
}