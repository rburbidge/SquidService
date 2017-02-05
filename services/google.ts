import * as https from 'https';
import * as express from 'express';
var request = require('request');

export default class Google {
    /**
     * Checks if a google token is valid. Callback is invoked with true if the token is valid; false otherwise.
     * TODO Strongly-type the return type
     */
    public static getTokenInfo(tokenType: string, token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // TODO fix this
            // Use request rather than https module here because it provides free response body parsing
            request({
                    url: `https://www.googleapis.com/oauth2/v3/tokeninfo?${tokenType}=${token}`,
                    json: true
                },
                function(error, response, body) {
                    // TODO Verify that the aud field matches one of my known client IDs

                    if(error) {
                        reject(error);
                    } else if(response.statusCode != 200) {
                        reject('response.statusCode=' + response.statusCode + ', body=' + body);
                    } else {
                        resolve(body);
                    }
                });
        });
    }

    // TODO Document why this is used as opposed to getTokenInfo()
    // TODO Strongly-type the return type
    public static getUserInfo(accessToken): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            // TODO fix this
            // Use request rather than https module here because it provides free response body parsing
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
                        resolve(body);
                    }
                });
        });
    }

    /**
     * Sends the payload data to a device with GCM registration token. Callback is invoked with true upon success; false otherwise.
     */
    public static sendGcmMessage(data, gcmToken): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let postData: string = JSON.stringify(
                {
                    data: data,
                    to: gcmToken
                });

            // TODO Do not hardcode API key
            let options: https.RequestOptions = {
                method: 'POST',
                host: 'gcm-http.googleapis.com',
                path: '/gcm/send',
                headers: {
                    Authorization: 'key=AIzaSyC5NfTAr56W2v7hRpsRhO11PqcHODVcwOU',
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