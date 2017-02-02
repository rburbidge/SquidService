export default class DeviceModel {
    id: string;
    name: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    public static convertDevices(devices: any): DeviceModel[] {
        let converted: DeviceModel[] = [];

        for (let currentDeviceId in devices) {
            if (devices.hasOwnProperty(currentDeviceId)) {
                var device = devices[currentDeviceId];
                converted.push(new DeviceModel(currentDeviceId, device.name));
            }
        }

        return converted;
    }
}