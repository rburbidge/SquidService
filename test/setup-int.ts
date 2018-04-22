/**
 * Sets up the test fixture, server, and database before each test.
 */

import { Config }  from '../config/config';
import { createServer, ServerOptions } from '../server';
import { Google } from '../services/google';
import { TestFixture } from './setup';

import * as http from 'http';
import * as mockgo from 'mockgo';
import * as mongodb from 'mongodb';
import * as winston from 'winston';
import { AppInsights } from './app-insights';

export function setupInt(): TestFixture {
    const testFixture: TestFixture = {
        server: null
    };
    let db: mongodb.Db;
    
    /**
     * Connect to an in-memory database that the tests will execute upon.
     * This is done once.
     */
    before((done) => {
        // Turn off server logging for tests. Turning it on causes the output to be interlaced with the test log output,
        // making it hard to read
        winston.configure({
            transports: []
        });
    
        mockgo.getConnection((error, connection) => {
            db = connection;
            done();
        })
    });
    
    /**
     * Before each tests runs, create the server and the test fixture.
     */
    beforeEach(() => {
        function createServerOptions(db: mongodb.Db): ServerOptions {
            const config: Config = {
                defaultPort: 3001,
                insightsKey: "insightsKey",
                googleApiKey: "apiKey",
                googleValidClientIds: ["clientId1", "clientId2"],
                database: {
                    name: 'test',
                    url: ''
                }
            };
            return {
                db: db,
                config: config,
                google: new Google(config.googleApiKey, config.googleValidClientIds),
                telemetry: new AppInsights()
            }
        }
    
        testFixture.serverOptions = createServerOptions(db);
        testFixture.server = createServer(testFixture.serverOptions);
    });
    
    /**
     * After each test runs, close the server and drop the entire database.
     */
    afterEach(() => {
        (testFixture.server as http.Server).close();
        return db.dropDatabase();
    });

    return testFixture;
}