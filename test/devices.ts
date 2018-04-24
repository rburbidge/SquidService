import { AddDeviceBody, DeviceModel, DeviceType, ErrorCode } from '../exposed/squid';
import { assertErrorModelResponse, setupTelemetry } from './helpers';
import { testFixture } from './setup';
import { User } from '../data/models/user';
import { setupGoogleGetIdTokenReturns, setupGoogleSendGcmMessageReturns } from './helpers';

import * as assert from 'assert';
import * as uuid from 'uuid';
import * as request from 'supertest';
import * as sinon from 'sinon';

describe('Devices', () => {
    beforeEach(() => {
        setupGoogleGetIdTokenReturns(Promise.resolve({} as User));
        setupTelemetry();
    });

    describe('GET devices', () => {
        it('Should return 404 when user does not exist', () => {
            return request(testFixture.server)
                .get('/api/devices')
                .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                .expect(404)
                .then(response => assertErrorModelResponse(response, 'The user does not exist', ErrorCode.UserNotFound))
        });

        it('Should return no devices when user exists but has no devices', () => {
            // To setup a user with no devices, add a device for the user, then remove their only device
            return testAddDevice()
                .then(device => testDeleteDevice(device.id))
                .then(() => testGetDevices([]));
        });

        it('Should return single device', () => {
            return testAddDevice()
                .then(device => testGetDevices([device]));
        });

        it('Should return multiple devices', () => {
            let device1: DeviceModel,
                device2: DeviceModel,
                device3: DeviceModel;

            return testAddDevice()
                .then(device => device1 = device)
                .then(() => testAddDevice())
                .then(device => device2 = device)
                .then(() => testAddDevice())
                .then(device => device3 = device)
                .then(() => testGetDevices([device1, device2, device3]));
        });
    });

    describe('POST devices', () => {
        it('Should return new device', () => testAddDevice());

        it('Should return original device if one with the same GCM token is added a second time', () => {
            const addDeviceBody = createAddDeviceBody();

            return testAddDevice(addDeviceBody)
                .then(originalDevice => {
                    return testAddDevice(addDeviceBody, 302)
                        .then(newDevice => assert.equal(newDevice.id, originalDevice.id, 'Returned device ID should equal the original device ID'));
                })
        });

        describe('Validation', () => {
            describe('gcmToken', () => {
                it('Should return 400 if gcmToken not passed', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.gcmToken = null;
                    return testAddDeviceFails(addDeviceBody);
                });
    
                it('Should return 400 if gcmToken is longer than 512 characters', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.gcmToken = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
                    return testAddDeviceFails(addDeviceBody);
                });
    
                it('Should return 200 if gcmToken is up to 512 characters', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.gcmToken = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
                    return testAddDevice(addDeviceBody);
                });
            });

            describe('deviceType', () => {
                it('Should return 400 if deviceType not passed', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.deviceType = null;
                    return testAddDeviceFails(addDeviceBody);
                });
    
                it('Should return 400 if deviceType not chrome or android', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.deviceType = DeviceType.android + "1" as any;
                    return testAddDeviceFails(addDeviceBody);
                });
    
                it('Should return 200 if deviceType is android', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.deviceType = DeviceType.android;
                    return testAddDevice(addDeviceBody);
                });
    
                it('Should return 200 if deviceType is chrome', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.deviceType = DeviceType.chrome;
                    return testAddDevice(addDeviceBody);
                });
            });

            describe('name', () => {
                it('Should return 400 if name not passed', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.name = null;
                    return testAddDeviceFails(addDeviceBody);
                });

                it('Should return 400 if name is greater than 25 characters', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.name = 'xxxxxxxxxxxxxxxxxxxxxxxxxx';
                    return testAddDeviceFails(addDeviceBody);
                });

                it('Should return 200 if name is up to 25 characters', () => {
                    let addDeviceBody = createAddDeviceBody();
                    addDeviceBody.name = 'xxxxxxxxxxxxxxxxxxxxxxxxx';
                    return testAddDevice(addDeviceBody);
                });
            });
        });

        it('Should return error when device limit is reached', () => {
            // Device limit is 10
            return testAddDevice()
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                .then(device => testAddDevice())
                // 10th device add succeeds
                .then(device => testAddDevice()) 
                // 11th device add fails
                .then(device => testAddDeviceFails(
                    createAddDeviceBody(),
                    'Devices limit reached. Cannot add more than 10 devices for a single user'))
        });
    });

    describe('DELETE devices/<deviceId>', () => {
        it('Should return 200 when user does not exist', () => {
            return testDeleteDevice('badId');
        });

        it('Should return 200 when device does not exist', () => {
            return testAddDevice()
                .then(device => testDeleteDevice('badId'));
        });

        it('Should return 200 when device exists', () => {
            return testAddDevice()
                .then(device => testDeleteDevice(device.id));
        });

        it('Should delete a device', () => {
            let device1: DeviceModel,
                device2: DeviceModel,
                device3: DeviceModel;

            // Add 3 devices
            return testAddDevice()
                .then(device => device1 = device)
                .then(() => testAddDevice())
                .then(device => device2 = device)
                .then(() => testAddDevice())
                .then(device => device3 = device)
                // Delete single device
                .then(() => testDeleteDevice(device2.id))
                // Check that other devices still remain
                .then(() => testGetDevices([device1, device3]))

        });
    });

    describe('POST devices/<deviceId>/commands', () => {
        it('Should return 404 when user does not exist', () => 
            request(testFixture.server)
                .post('/api/devices/badId/commands')
                .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                .send({ url: 'http://www.google.com' })
                .expect(404)
                .then(response => assertErrorModelResponse(response, 'User does not exist', ErrorCode.UserNotFound)));

        it('Should return 404 when device does not exist', () => 
            testAddDevice()
                .then(device => request(testFixture.server)
                    .post('/api/devices/badId/commands')
                    .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                    .send({ url: 'http://www.google.com' })
                    .expect(404))
                .then(response => assertErrorModelResponse(response, 'Device does not exist', ErrorCode.DeviceNotFound))
        );

        it('Should return 500 when GCM token is invalid', () => {
            setupGoogleSendGcmMessageReturns(Promise.reject("Some error occurred"));
            return testAddDevice()
                .then(device => request(testFixture.server)
                    .post('/api/devices/' + device.id + '/commands')
                    .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                    .send({ url: 'http://www.google.com' })
                    .expect(500))
                .then(response => assertErrorModelResponse(response, 'Internal server error occurred', ErrorCode.Unknown));
        });

        it('Should return 200', () => {
            setupGoogleSendGcmMessageReturns(Promise.resolve());
            return testAddDevice()
                .then(device => request(testFixture.server)
                    .post('/api/devices/' + device.id + '/commands')
                    .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
                    .send({ url: 'http://www.google.com' })
                    .expect(200))
        });
    });

    function testAddDevice(addDeviceBody: AddDeviceBody = createAddDeviceBody(), expectedStatusCode = 200): Promise<DeviceModel> {
        return request(testFixture.server)
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
        return request(testFixture.server)
            .post('/api/devices')
            .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
            .send(addDeviceBody)
            .expect(400)
            .then(response => assertErrorModelResponse(response, expectedErrorMessage, ErrorCode.BadRequest));
    }

    function testGetDevices(expected: DeviceModel[]): Promise<void> {
        return request(testFixture.server)
            .get('/api/devices')
            .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
            .expect(200)
            .then(response => assert.deepEqual(response.body, expected));
    }

    function testDeleteDevice(deviceId: string): Promise<void> {
        return request(testFixture.server)
            .delete('/api/devices/' + deviceId)
            .set('Authorization', 'Bearer Google OAuth ID Token=GOOD ID TOKEN')
            .expect(200)
            .then(() => {});
    }

    function createAddDeviceBody(): AddDeviceBody {
        return {
            name: 'DeviceName ' + uuid.v4().toString().substr(0, 8),
            gcmToken: uuid.v4(),
            deviceType: DeviceType.android
        };
    }
});