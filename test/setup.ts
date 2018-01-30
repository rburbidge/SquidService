import { ServerOptions } from '../server';
import { setupInt } from './setup-int';
import { setupE2E } from './setup-e2e';

import * as http from 'http';

export let testFixture: TestFixture;

export interface TestFixture {
    serverOptions?: ServerOptions;
    server: http.Server | string;
}

const testCategory = process.env.TEST_CATEGORY;

if(!testCategory) {
    throw 'Test category was not found. Set TEST_CATEGORY';
}

console.log(`Test category: ${testCategory}`);

switch (testCategory) {
    case 'int':
        testFixture = setupInt();
        break;
    case 'e2e':
        testFixture = setupE2E();
        break;
    default:
        throw `Test category "${testCategory}" is not a supported test type`;
}