/*
 * Converts a dictionary of device IDs -> devices to a flat list of:
 * {
 *      id: string,
 *      name: string  
 * }
 */
module.exports = function(devices) {
    function Device(id, name) {
        this.id = id;
        this.name = name;
    }

    var converted = [];

    for(var currentDeviceId in devices) {
        if(devices.hasOwnProperty(currentDeviceId)) {
            var device = devices[currentDeviceId];
            converted.push(new Device(currentDeviceId, device.name));
        }
    }

    return converted;
};