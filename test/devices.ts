import { AddDeviceBody, DeviceModel, DeviceType, ErrorCode } from '../exposed/squid';
import { assertErrorModelResponse } from './helpers';
import { server, testFixture } from './setup';
import { User } from '../data/models/user';
import { setupGoogleGetIdTokenReturns, setupGoogleSendGcmMessageReturns } from './helpers';

import * as assert from 'assert';
import * as uuid from 'uuid';
import * as request from 'supertest';
import * as sinon from 'sinon';

describe('Devices', () => {
    beforeEach(() => {
        setupGoogleGetIdTokenReturns(Promise.resolve({} as User));
    });

    it('GET devices should return 404', () => {
        return request(server)
            .get('/api/devices')
            .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
            .expect(404)
            .then(response => assertErrorModelResponse(response, 'The user does not exist', ErrorCode.UserNotFound))
    });

    describe('POST devices', () => {
        it('Should return new device', () => testAddDevice());

        it('Should return original device if one with the same GCM token is added a second time', () =>
            testAddDevice()
                .then(originalDevice => {
                    return testAddDevice(undefined, 302)
                        .then(newDevice => assert.equal(newDevice.id, originalDevice.id, ''));
                })
        );

        it('Should return 400 if gcmToken not passed', () => {
            let addDeviceBody = createAddDeviceBody();
            addDeviceBody.gcmToken = null;
            return testAddDeviceFails(addDeviceBody);
        });

        it('Should return 400 if deviceType not passed', () => {
            let addDeviceBody = createAddDeviceBody();
            addDeviceBody.deviceType = null;
            return testAddDeviceFails(addDeviceBody);
        });

        it('Should return 400 if name not passed', () => {
            let addDeviceBody = createAddDeviceBody();
            addDeviceBody.name = null;
            return testAddDeviceFails(addDeviceBody);
        });      

        it('Should return error when device limit is reached', () => {
            function testAddDeviceWithUniqueGcmToken(): Promise<DeviceModel> {
                const addDeviceBody = createAddDeviceBody();
                addDeviceBody.gcmToken = uuid.v4();
                return testAddDevice(addDeviceBody);
            }

            // Device limit is 10
            return testAddDeviceWithUniqueGcmToken()
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                .then(device => testAddDeviceWithUniqueGcmToken())
                // 10th device add succeeds
                .then(device => testAddDeviceWithUniqueGcmToken()) 
                // 11th device add fails
                .then(device => testAddDeviceFails(
                    createAddDeviceBody(),
                    'Devices limit reached. Cannot add more than 10 devices for a single user'))
        });
    });

    describe('POST devices/<deviceId>/commands', () => {
        it('Should return 404 when user does not exist', () => 
            request(server)
                .post('/api/devices/badId/commands')
                .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                .send({ url: 'http://www.google.com' })
                .expect(404)
                .then(response => assertErrorModelResponse(response, 'User does not exist', ErrorCode.UserNotFound)));

        it('Should return 404 when device does not exist', () => 
            testAddDevice()
                .then(device => request(server)
                    .post('/api/devices/badId/commands')
                    .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                    .send({ url: 'http://www.google.com' })
                    .expect(404))
                .then(response => assertErrorModelResponse(response, 'Device does not exist', ErrorCode.DeviceNotFound))
        );

        it('Should return 500 when GCM token is invalid', () => {
            setupGoogleSendGcmMessageReturns(Promise.reject("Some error occurred"));
            return testAddDevice()
                .then(device => request(server)
                    .post('/api/devices/' + device.id + '/commands')
                    .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                    .send({ url: 'http://www.google.com' })
                    .expect(500))
                .then(response => assertErrorModelResponse(response, 'Internal server error occurred', ErrorCode.Unknown));
        });

        it('Should return 200', () => {
            setupGoogleSendGcmMessageReturns(Promise.resolve());
            return testAddDevice()
                .then(device => request(server)
                    .post('/api/devices/' + device.id + '/commands')
                    .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                    .send({ url: 'http://www.google.com' })
                    .expect(200))
        });
    });

    function testAddDevice(addDeviceBody: AddDeviceBody = createAddDeviceBody(), expectedStatusCode = 200): Promise<DeviceModel> {
        return request(server)
            .post('/api/devices')
            .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
            .send(addDeviceBody)
            .expect(expectedStatusCode)
            .then(response => {
                const device = response.body as DeviceModel;
                assert.equal(device.name, addDeviceBody.name);
                assert.equal(device.deviceType, addDeviceBody.deviceType);
                assert.ok(device.id, 'device.id was undefined');
                return device;
            });
    }

    function testAddDeviceFails(addDeviceBody: AddDeviceBody, expectedErrorMessage: string = 'Malformed request'): Promise<void> {       
        return request(server)
            .post('/api/devices')
            .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
            .send(addDeviceBody)
            .expect(400)
            .then(response => assertErrorModelResponse(response, expectedErrorMessage, ErrorCode.BadRequest));
    }

    function createAddDeviceBody(): AddDeviceBody {
        return {
            name: 'DeviceName',
            gcmToken: 'GcmToken',
            deviceType: DeviceType.android
        };
    }
});