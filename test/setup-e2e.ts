import { TestFixture } from './setup';

export function setupE2E(testTarget: string): TestFixture {
    return {
        server: testTarget
    };
}