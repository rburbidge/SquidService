import User from './models/user';
import Device from './models/device';
import * as mongodb from 'mongodb';
let uuid = require('uuid');

/**
 * The devices database.
 */
export default class Devices {

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
     */
    public addDevice(userId: string, name: string, gcmToken: string): Promise<Device> {
        let deviceId: string = uuid.v4();
        let device: Device = {
            id: deviceId,
            gcmToken: gcmToken,
            name: name
        };
        
        // Tries to add the device to an existing user in the database. If the user doesn't exist, then adds the
        // device under a new user
        return new Promise((resolve, reject) => {
            this.collection.updateOne({ userId: userId }, { $push: { devices: device }})
                .then(result => {
                    // Device added to existing user
                    if(result.modifiedCount === 1) {
                        console.log(`Device ${deviceId} added to existing user`);
                        resolve(device);
                        return;
                    }

                    // New user with new device
                    let user: User = {
                        userId: userId,
                        devices: [ device ]
                    };
                    this.collection.insert(user)
                        .then(result => {
                            if(result.insertedCount === 1) {
                                console.log(`Device ${deviceId} added to new user`);
                                resolve(device);
                                return;
                            }

                            console.log('ERROR: Unable to add device to new user');
                            reject();
                        })
                        .catch(reject);
                })
                .catch(reject);
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
    public removeDevice(userId: string, deviceId: string): Promise<any> {
        let unsetObj = { $unset: {} };
        unsetObj.$unset['devices.' + deviceId] = 1;

        return this.collection.updateOne({ userId: userId }, { $pull: { 'devices' : { id: deviceId }}});
    }
}