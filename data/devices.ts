import { ErrorModel } from '../models/error-model';
import { ErrorCode } from '../exposed/error-model';
import { Device } from './models/device';
import { User } from './models/user';
import * as mongodb from 'mongodb';
let uuid = require('uuid');

/**
 * The devices database.
 */
export class Devices {

    private static readonly maxNumDevicesPerUser = 10;
    private collection: mongodb.Collection;

    constructor(collection: mongodb.Collection) {
        this.collection = collection
    }

    /**
     * Adds a device for a user. If the user doesn't exist, adds a new user with the device.
     * The device is assigned a unique ID: a randomly generated UUID.
     * @param userId The user ID.
     * @param name The device name.
     * @param gcmToken The device GCM token.
     * @throws ErrorModel | any if an error occurs.
     */
    public addDevice(userId: string, name: string, gcmToken: string): Promise<AddDeviceResult> {
        return this.getUser(userId)
            .then(user => {
                if(!user || !user.devices) return;

                // Return existing device if one with the same GCM token already exists
                const devicesWithGcmToken = user.devices.filter(device => device.gcmToken == gcmToken);
                if(devicesWithGcmToken.length > 0) {
                    console.log(`A device with GCM token ${gcmToken} already exists`);
                    return devicesWithGcmToken[0];
                }

                // Limit the number of devices per user
                if(user.devices.length >= Devices.maxNumDevicesPerUser) {
                    throw new ErrorModel(ErrorCode.BadRequest, `Devices limit reached. Cannot add more than ${Devices.maxNumDevicesPerUser} devices for a single user`);
                }
            })
            .then(device => {
                // If the device existed, then return it. Otherwise, create the device
                if(device) {
                    return Promise.resolve({ device: device, added: false });
                }

                const newDevice: Device = {
                    id: uuid.v4(),
                    gcmToken: gcmToken,
                    name: name
                };
                return this.addDeviceToDb(userId, newDevice)
                    .then(device => {
                        return { device: device, added: true};
                    });
            });
    }

    /**
     * Adds the device to either an existing user or a new user.
     * @param userId The user ID.
     * @param device The device to be added.
     */
    private addDeviceToDb(userId: string, device: Device): Promise<Device> {
        // Tries to add the device to an existing user in the database. If the user doesn't exist, then adds the
        // device under a new user
        return this.collection.updateOne({ userId: userId }, { $push: { devices: device }})
        .then((result: mongodb.UpdateWriteOpResult) => {
            // Device added to existing user
            if(result.modifiedCount === 1) {
                console.log(`Device ${device.id} added to existing user`);
                return Promise.resolve(device);
            }

            // New user with new device
            let user: User = {
                userId: userId,
                devices: [ device ]
            };
            return this.collection.insert(user)
                .then(result => {
                    if(result.insertedCount === 1) {
                        console.log(`Device ${device.id} added to new user`);
                        return device;
                    }
                    throw new Error('ERROR: Unable to add device to new user');
                })
        });
    }

    /**
     * Gets a user by their ID.
     * @param userId The user ID.
     */
    public getUser(userId: string): Promise<User> {
        return this.collection.findOne({ 'userId': userId }) as Promise<User>;
    }

    /**
     * Removes a user's device.
     * @param userId The user ID.
     * @param deviceId The device ID.
     */
    public removeDevice(userId: string, deviceId: string): Promise<boolean> {
        let unsetObj = { $unset: {} };
        unsetObj.$unset['devices.' + deviceId] = 1;

        return this.collection.updateOne({ userId: userId }, { $pull: { 'devices' : { id: deviceId }}})
            .then(result => result.modifiedCount > 0);
    }
}

export interface AddDeviceResult {
    /** The device that was added. */
    device: Device;

    /** True if the device was created; false if already existed. */
    added: boolean;
}