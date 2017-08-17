import { Device } from '../data/models/device';

export class DeviceModel {
    id: string;
    name: string;

    constructor(device: Device) {
        this.id = device.id;
        this.name = device.name;
    }
}