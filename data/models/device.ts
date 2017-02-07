export default class Device {
    /* The device ID, defined by the server. */
    public id: string;

    /* The name, defined by the client. */
    public name: string;

    /* The Google Cloud Messaging token, from the Android device. */
    public gcmToken: string;
}