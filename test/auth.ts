import { createServer } from '../server';
import { ErrorCode, ErrorModel } from '../exposed/squid';

import * as assert from 'assert';
import * as express from 'express';
import * as http from 'http';

const request = require('supertest');

describe('Authentication', function() {
    let app: http.Server;

    before(() => createServer()
        .then(expressApp => app = expressApp));
    
    after(() => app.close());

    it('GET devices should return 401 with no Authorization header', () =>
        request(app)
            .get('/api/devices')
            .expect(401)
            .then(response => testAuthorizationError(response, 'Authorization header must be sent with Google token'))
    );

    it('GET devices should return 401 with empty Authorization header', () =>
        request(app)
            .get('/api/devices')
            .set('Authorization', '')
            .expect(401)
            .then(response => testAuthorizationError(response, 'Authorization header must be sent with Google token'))
    );

    it('GET devices should return 401 with bad Authorization header', () =>
        request(app)
            .get('/api/devices')
            .set('Authorization', 'BAD AUTH HEADER')
            .expect(401)
            .then(response => testAuthorizationError(response, 'Unable to parse Authorization header token'))
    );

    describe('Access Token', () => {
        it('GET devices should return 401 with bad access token', () =>
            request(app)
                .get('/api/devices')
                .set('Authorization', 'Bearer Google OAuth Access Token=BAD ACCESS TOKEN')
                .expect(401)
                .then(response => testAuthorizationError(response, 'Error validating Google access token'))
        );

        it('GET devices should return 401 with expired access token', () =>
            request(app)
                .get('/api/devices')
                .set('Authorization', 'Bearer Google OAuth Access Token=ya29.GmBCBXQhmR4WIbyc7oFmgH49m6D5WYKBcDdkmAXGOhN5Zs8D6_u-X4LY3ctJTlKSYQrvAk9PpGrWI6ZqncRs_HS3mx9ZlTbmHJkcnnbkpO1rH6b7raxD2gJSkf4nNsR1kVk')
                .expect(401)
                .then(response => testAuthorizationError(response, 'Error validating Google access token'))
        );
    });

    describe('ID Token', () => {
        it('GET devices should return 401 with bad ID token', () =>
            request(app)
                .get('/api/devices')
                .set('Authorization', 'Bearer Google OAuth ID Token=BAD ID TOKEN')
                .expect(401)
                .then(response => testAuthorizationError(response, 'Error validating Google ID token'))
        );

        it('GET devices should return 401 with expired ID token', () =>
            request(app)
                .get('/api/devices')
                .set('Authorization', 'Bearer Google OAuth ID Token=eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwMjdkNDNmMzVmOTBmM2QxYjk0NTc0Yjc4OTFhNjg4YjI4ZjAyZGUifQ.eyJhenAiOiI2NzAzMTY5ODY2MDktY3E4MTR1NXVlMWNvZWg2czM5a21wczZxbzRybGtlNGguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2NzAzMTY5ODY2MDktOTFkbWx1NTNlb2pybzJwZjMxMWtnN2NnZGg3N2lyZWguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTc0MjUzOTc0NDU2NDI4NzYwMTkiLCJleHAiOjE1MTU5NjM2ODUsImlzcyI6Imh0dHBzOi8vYWNjb3VudHMuZ29vZ2xlLmNvbSIsImlhdCI6MTUxNTk2MDA4NSwibmFtZSI6IlJ5YW4gQnVyYmlkZ2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDYuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy0tQlVfbVAwTk5iMC9BQUFBQUFBQUFBSS9BQUFBQUFBQUFCVS9fQTFMNFFsVV9VMC9zOTYtYy9waG90by5qcGciLCJnaXZlbl9uYW1lIjoiUnlhbiIsImZhbWlseV9uYW1lIjoiQnVyYmlkZ2UiLCJsb2NhbGUiOiJlbiJ9.y1Gz94Wsp9hzK3uCrhHwDuEg7boRyl7a1EEJy4-xTUYMXA-ZFzSQ7fuCokQbl75wv2hafVbXBJzjmGtDoTgboT01nziUCac4mwToa9fiE_lb59yuplBG3HReCBt3Wox2DFaWlUQMnH41GBmUZEIgzFfoYqJxTLPKARlEF0pJ4I2Y9mt4KWHVsmHuhoth2_yKwHWcVs7ARisF0XFYeTKpc1qleXTxmxeCTKMRCCKXj4rBJuKFtQD8Mca8hYZdyxlNKMFyW0uuDLeD1_GiCAqE-Mbg1ks3ch9EhJs6kdGNGdr5c-ucBqBHba4yOWVJUJjLUEdP7bZSV8Whz0vxiTxySA')
                .expect(401)
                .then(response => testAuthorizationError(response, 'Error validating Google ID token'))
        );
    });

    /** Tests that the response contains an ErrorModel response body with the correct error message. */
    function testAuthorizationError(response: any, expectedMessage: string) {
        const errorModel = response.body as ErrorModel;
        assert.equal(errorModel.code, ErrorCode.Authorization);
        assert.equal(errorModel.codeString, 'Authorization');
        assert.equal(errorModel.message, expectedMessage);
    }
});