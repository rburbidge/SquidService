import { createServer } from '../server';
import { ErrorCode } from '../exposed/squid';
import { ErrorModel } from '../models/error-model';
import { Google } from '../services/google';
import { User } from '../data/models/user';

import * as assert from 'assert';
import * as express from 'express';
import * as http from 'http';
import * as request from 'supertest';
import * as sinon from 'sinon';

describe('Authentication', function() {
    let app: http.Server;

    let google: Google;

    beforeEach(() =>  {
        google = new Google("apiKey", ["clientId1", "clientId2"]);
        
        return createServer(google)
            .then(expressApp => app = expressApp);
    });
    
    afterEach(() => app.close());

    describe('Succeeds', () => {
        beforeEach(() => {
            setupGoogleGetIdTokenReturns(Promise.resolve({} as User));
            setupGoogleGetAccessTokenReturns(Promise.resolve({} as User));
        });

        it('Succeeds with valid ID token', () => {
            //setupGoogleGetIdTokenReturns(Promise.resolve({} as User));
            return testSucceeds('Bearer Google OAuth ID Token=GOOD ID TOKEN');
        });
    
        it('Succeeds with valid access token', () => {
            //setupGoogleGetAccessTokenReturns(Promise.resolve({} as User));
            return testSucceeds('Bearer Google OAuth Access Token=GOOD ACCESS TOKEN');
        });

        function testSucceeds(authHeader) {
            return request(app)
                .get('/api/devices')
                .set('Authorization', authHeader)
                .expect(404)
                .then(response => testErrorModelEquals(response.body as ErrorModel, 'The user does not exist', ErrorCode.UserNotFound))
        }
    });

    describe('Fails', () => {
        const noTokenErrorMessage = 'Authorization header must be sent with Google token';
        
        it('GET devices should return 401 with no Authorization header', () =>
            request(app)
                .get('/api/devices')
                .expect(401)
                .then(response => testErrorModelEquals(response.body as ErrorModel, noTokenErrorMessage, ErrorCode.Authorization))
        );
    
        it('GET devices should return 401 with empty Authorization header',
            () => testAuthFailure('', noTokenErrorMessage));
    
        it('GET devices should return 401 with bad Authorization header',
            () => testAuthFailure('BAD AUTH HEADER', 'Unable to parse Authorization header token'));
            
        it('GET devices should return 401 with bad access token', () => {
            const errorMessage: string = 'Some bad access token';
            setupGoogleGetAccessTokenReturns(Promise.reject(new ErrorModel(ErrorCode.Authorization, errorMessage)));
            return testAuthFailure(
                'Bearer Google OAuth Access Token=BAD ACCESS TOKEN',
                errorMessage);
        });
        
        it('GET devices should return 401 with bad ID token', () => {
            const errorMessage: string = 'Some bad ID token';
            setupGoogleGetIdTokenReturns(Promise.reject(new ErrorModel(ErrorCode.Authorization, errorMessage)));
            return testAuthFailure(
                'Bearer Google OAuth ID Token=BAD ID TOKEN',
                errorMessage);
        });
    
        /**
         * Tests an endpoint with a given Authorization header. Validates that 401 response is returned with correct error
         * message.
         */
        function testAuthFailure(authHeader: string, expectedMessage: string): Promise<void> {
            return request(app)
                .get('/api/devices')
                .set('Authorization', authHeader)
                .expect(401)
                .then(response => testErrorModelEquals(response.body as ErrorModel, expectedMessage, ErrorCode.Authorization))
        }
    });

    function setupGoogleGetIdTokenReturns(result: Promise<User>) {
        let getIdTokenUser = sinon.stub(google, 'getIdTokenUser');
        getIdTokenUser.returns(result);
    }

    function setupGoogleGetAccessTokenReturns(result: Promise<User>) {
        let getAccessTokenUser = sinon.stub(google, 'getAccessTokenUser');
        getAccessTokenUser.returns(result);
    }

    function testErrorModelEquals(errorModel: ErrorModel, expectedMessage: string, expectedCode: ErrorCode) {
        assert.equal(errorModel.code, expectedCode);
        assert.equal(errorModel.codeString, ErrorCode[expectedCode]);
        assert.equal(errorModel.message, expectedMessage);
    }
});