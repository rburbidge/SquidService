import { ErrorCode } from '../exposed/squid';
import { ErrorModel } from '../models/error-model';

import * as assert from 'assert';
import * as http from 'express';
import * as request from 'supertest';

export function assertErrorModelResponse(response: request.Response, expectedMessage: string, expectedCode: ErrorCode) {
    let errorModel = response.body as ErrorModel;

    assert.equal(errorModel.code, expectedCode);
    assert.equal(errorModel.codeString, ErrorCode[expectedCode]);
    assert.equal(errorModel.message, expectedMessage);
}