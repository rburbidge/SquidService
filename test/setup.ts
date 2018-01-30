import { ServerOptions } from '../server';
import { setupInt } from './setup-int';
import { setupE2E } from './setup-e2e';

import * as http from 'http';

export let testFixture: TestFixture;

export interface TestFixture {
    serverOptions?: ServerOptions;
    server: http.Server | string;
}

const testTarget = process.env.TEST_TARGET;

if(!testTarget) {
    console.log(`TEST_TARGET=local`);
    testFixture = setupInt();
} else {
    console.log(`TEST_TARGET=${testTarget}`);
    testFixture = setupE2E(testTarget);
}