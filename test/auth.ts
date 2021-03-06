import {
    assertErrorModelResponse,
    setupGoogleGetAccessTokenReturns,
    setupGoogleGetIdTokenReturns,
    setupGoogleSendGcmMessageReturns
} from './helpers';
import { Config }  from '../config/config';
import { createServer } from '../server';
import { ErrorCode } from '../exposed/squid';
import { ErrorModel } from '../models/error-model';
import { Google } from '../services/google';
import { UserDevices } from '../data/models/user-devices';

import * as express from 'express';
import * as http from 'http';
import * as mongodb from 'mongodb';
import * as request from 'supertest';
import * as sinon from 'sinon';

import { testFixture } from './setup';

describe('Authentication', function() {
    describe('Succeeds', () => {
        it('Succeeds with valid ID token', () => {
            setupGoogleGetIdTokenReturns(Promise.resolve({} as UserDevices));
            return testSucceeds('Bearer Google OAuth ID Token=GOOD ID TOKEN');
        });
    
        it('Succeeds with valid access token', () => {
            setupGoogleGetAccessTokenReturns(Promise.resolve({} as UserDevices));
            return testSucceeds('Bearer Google OAuth Access Token=GOOD ACCESS TOKEN');
        });

        function testSucceeds(authHeader) {
            return request(testFixture.server)
                .get('/api/devices')
                .set('Authorization', authHeader)
                .expect(404)
                .then(response => assertErrorModelResponse(response, 'The user does not exist', ErrorCode.UserNotFound))
        }
    });

    describe('Fails', () => {
        const noTokenErrorMessage = 'Authorization header must be sent with Google token';
        
        it('@e2e GET devices should return 401 with no Authorization header', () =>
            request(testFixture.server)
                .get('/api/devices')
                .expect(401)
                .then(response => assertErrorModelResponse(response, noTokenErrorMessage, ErrorCode.Authorization))
        );
    
        it('@e2e GET devices should return 401 with empty Authorization header',
            () => testAuthFailure('', noTokenErrorMessage));
    
        it('@e2e GET devices should return 401 with bad Authorization header',
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
            return request(testFixture.server)
                .get('/api/devices')
                .set('Authorization', authHeader)
                .expect(401)
                .then(response => assertErrorModelResponse(response, expectedMessage, ErrorCode.Authorization))
        }
    });
});