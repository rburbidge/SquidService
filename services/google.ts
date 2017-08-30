import { ErrorModel, ErrorCode } from '../models/error-model'
import { User } from '../auth/user';
import { TokenType } from '../auth/token-type';

import * as https from 'https';
import * as express from 'express';
var request = require('request');

/** Contains helpers to access Google services. */
export class Google {

    /**
     * Creates a new instance.
     * @param apiKey The API key used to send GCM messages.
     * @param clientIds The set of valid Google client IDs.
     */
    constructor(private readonly apiKey: string, private readonly clientIds: Array<string>) { }

    /**
     * Checks if a Google token is valid.
     * 
     * If the token is an access token, then this will return true because an access token contains no user data.
     * If the token is an ID token, then this will return the user info contained within.
     */
    public getTokenInfo(tokenType: string, token: string): Promise<User> {
        return new Promise<any>((resolve, reject) => {
            // Use request rather than https module here because it provides free response body parsing
            // TODO Move away from using request
            request({
                    url: `https://www.googleapis.com/oauth2/v3/tokeninfo?${tokenType}=${token}`,
                    json: true
                },
                (error, response, body: IGoogleIdToken) => {
                    if(error) {
                        reject(new ErrorModel(ErrorCode.Authorization, 'Error validating Google token: ' +
                            JSON.stringify(error)));
                    } else if(response.statusCode != 200) {
                        reject(new ErrorModel(ErrorCode.Authorization, 'Error validating Google token: response.statusCode=' +
                            response.statusCode + ', body=' + body));
                    } else if(!this.clientIds) {
                        reject(new ErrorModel(ErrorCode.ServiceConfig, 'Google clientIds is null'));
                    } else if(this.clientIds.indexOf(body.aud) == -1) {
                        reject(new ErrorModel(ErrorCode.Authorization, 'Google token had invalid client ID in aud field:' +
                            body.aud));
                    } else if(tokenType == TokenType.Id) {
                        resolve(User.fromIdToken(body));
                    } else if(tokenType == TokenType.Access) {
                        // In access token case, we need to get user information from another API first, so we don't have
                        // a full user object yet. Return true to indicate that auth succeeded
                        resolve(true);
                    } else {
                        reject(new ErrorModel(ErrorCode.BadRequest, `Unknown tokenType=${tokenType}`));
                    }
                });
        });
    }

    /**
     * Retrieves the user info for an access token.
     * 
     * Required because access tokens do not contain the user info, such as the user's unique ID.
     * @param accessToken The access token.
     */
    public static getUserInfo(accessToken: string): Promise<User> {
        return new Promise<any>((resolve, reject) => {
            // Use request rather than https module here because it provides free response body parsing
            // TODO Move away from using request
            request({
                    url: `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
                    json: true
                },
                function(error, response, body) {
                    if(error) {
                        reject(error);
                    } else if(response.statusCode != 200) {
                        reject('response.statusCode=' + response.statusCode + ', body=' + body);
                    } else {
                        resolve(User.fromUserInfo(body));
                    }
                });
        });
    }

    /**
     * Sends the payload data to a device with GCM registration token.
     */
    public sendGcmMessage(data: IMessage, gcmToken: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let postData: string = JSON.stringify(
                {
                    data: data,
                    to: gcmToken
                });

            let options: https.RequestOptions = {
                method: 'POST',
                host: 'gcm-http.googleapis.com',
                path: '/gcm/send',
                headers: {
                    Authorization: 'key=' + this.apiKey,
                    'Content-Type': 'application/json', 
                    'Content-Length': postData.length
                }
            };
            let googleReq = https.request(options, (resp) => {
                if(resp.statusCode === 200) {
                    console.log('GCM message sent: ' + data);
                    resolve();
                } else {
                    console.log('GCM message failed: statusCode=' + resp.statusCode);
                    reject();
                }
            });
            googleReq.write(postData);
            googleReq.end();
        });
    }
}

/**
 * TODO Get URL for dev guide for this API.
 */
export interface IGoogleIdToken {
    /** The token's Google client ID. */
    aud: string;

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