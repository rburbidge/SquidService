/*
 * Converts a dictionary of device IDs -> devices to a flat list of:
 * {
 *      id: string,
 *      name: string  
 * }
 */
module.exports = {
    Device: function(id, name) {
        this.id = id;
        this.name = name;
    },

    convertDevices: function(devices) {
        var converted = [];

        for(var currentDeviceId in devices) {
            if(devices.hasOwnProperty(currentDeviceId)) {
                var device = devices[currentDeviceId];
                converted.push(new this.Device(currentDeviceId, device.name));
            }
        }

        return converted;
    }
};