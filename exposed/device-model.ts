/** Device returned by SquidService. */
export interface DeviceModel {
    /** The device unique ID, defined by SquidService. */
    readonly id: string;

    /** The device name displayable in the UI. e.g. "Nexus 5". */
    readonly name: string;
}