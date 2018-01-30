import { TestFixture } from './setup';

export function setupE2E(): TestFixture {
    return {
        server: "http://localhost:3000"
    };
}