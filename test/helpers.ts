import { ErrorCode } from '../exposed/squid';
import { ErrorModel } from '../models/error-model';
import { testFixture } from './setup';
import { User } from '../data/models/user';

import * as assert from 'assert';
import * as http from 'express';
import * as request from 'supertest';
import * as sinon from 'sinon';

export function assertErrorModelResponse(response: request.Response, expectedMessage: string, expectedCode: ErrorCode) {
    let errorModel = response.body as ErrorModel;

    assert.equal(errorModel.codeString, ErrorCode[expectedCode]);
    assert.equal(errorModel.code, expectedCode);
    assert.equal(errorModel.message, expectedMessage);
}

export function setupGoogleGetAccessTokenReturns(result: Promise<User>) {
    let getAccessTokenUser = sinon.stub(testFixture.serverOptions.google, 'getAccessTokenUser');
    getAccessTokenUser.returns(result);
}

export function setupGoogleGetIdTokenReturns(result: Promise<User>) {
    let getIdTokenUser = sinon.stub(testFixture.serverOptions.google, 'getIdTokenUser');
    getIdTokenUser.returns(result);
}

export function setupGoogleSendGcmMessageReturns(result: Promise<void>) {
    let sendGcmMessage = sinon.stub(testFixture.serverOptions.google, 'sendGcmMessage');
    sendGcmMessage.returns(result);
}