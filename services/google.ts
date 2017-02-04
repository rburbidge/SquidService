var https = require('https'),
    request = require('request');
export default class Google {
    /**
     * Checks if a google token is valid. Callback is invoked with true if the token is valid; false otherwise.
     */
    public static getTokenInfo(tokenType: string, token: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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

    public static getUserInfo(accessToken, callback, errorCallback) {
        // Use request rather than https module here because it provides free response body parsing
        request({
                url: `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
                json: true
            },
            function(error, response, body) {
                if(error) {
                    errorCallback(error);
                } else if(response.statusCode != 200) {
                    errorCallback('response.statusCode=' + response.statusCode + ', body=' + body);
                } else {
                    callback(body);
                }
            });
    }

    /**
     * Sends the payload data to a device with GCM registration token. Callback is invoked with true upon success; false otherwise.
     */
    public static sendGcmMessage(data, gcmToken, callback) {
        var postData = JSON.stringify(
            {
                data: data,
                to: gcmToken
            });

        // TODO Do not hardcode API key
        var options = {
            method: 'POST',
            host: 'gcm-http.googleapis.com',
            path: '/gcm/send',
            headers: {
                Authorization: 'key=AIzaSyC5NfTAr56W2v7hRpsRhO11PqcHODVcwOU',
                'Content-Type': 'application/json', 
                'Content-Length': postData.length
            }
        };
        var googleReq = https.request(options, function(resp) {
            if(resp.statusCode === 200) {
                console.log('GCM message sent: ' + data);
            } else {
                console.log('GCM message failed: statusCode=' + resp.statusCode);
            }

            callback(resp.statusCode === 200);
        });
        googleReq.write(postData);
        googleReq.end();
    }
}