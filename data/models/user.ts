import Device from './device';

/**
 * The user class. Can be used to gain access to a user's devices.
 */
export default class User {
    /**
     * The devices by their ID.
     */
    private devices: { [id: string]: Device} = {};

    /**
     * Adds a device for the user.
     * @param  {string} name - The device name.
     * @param  {string} gcmToken - The GCM token.
     * @return {Device} The newly added device.
     */
    public addDevice(name: string, gcmToken: string): Device {
        // Add the device
        let uuid = require('uuid');
        let deviceId: string = uuid.v4();

        if (this.devices[deviceId]) {
            console.log('Device with ID=' + deviceId + ' already exists');
        } else {
            console.log('Adding new device with ID=' + deviceId);
            this.devices[deviceId] = {
                id: deviceId,
                name: name,
                gcmToken: gcmToken
            };
        } 

        return this.devices[deviceId];
    }

    /**
     * Gets the user's devices.
     * @return {Device[]} The devices.
     */
    public getDevices(): Device[] {
        let result: Device[] = [];
        let currentDeviceId: string;
        for (currentDeviceId in this.devices) {
            if (this.devices.hasOwnProperty(currentDeviceId)) {
                result.push(this.devices[currentDeviceId]);
            }
        }
        return result;    
    }

    /**
     * Removes a device.
     * @param  {string} id - The ID.
     * @return {Device} The device that was removed, or undefined.
     */
    public removeDevice(id: string): Device {
        let device = this.devices[id];
        delete this.devices[id];
        return device;
    }

    /**
     * Gets a device by ID.
     * @param  {string} id - The ID.
     * @return {Device} The device, or undefined.
     */
    public getDeviceById(id: string): Device {
        return this.devices[id];
    }

    /**
     * Gets a device by GCM token.
     * @param  {string} gcmToken - The GCM token.
     * @return {Device} The device, or undefined.
     */
    public getDeviceByGcmToken(gcmToken: string): Device {
        let currentDeviceId: string;
        for (currentDeviceId in this.devices) {
            if (this.devices.hasOwnProperty(currentDeviceId)) {
                let currentDevice: Device = this.devices[currentDeviceId];
                if (currentDevice.gcmToken === gcmToken) {
                    return currentDevice;
                }
            }
        }

        return undefined;
    }
}