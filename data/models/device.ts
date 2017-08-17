export interface Device {
    /* The device ID, defined by the server. */
    id: string;

    /* The name, defined by the client. */
    name: string;

    /* The Google Cloud Messaging token, from the Android device. */
    gcmToken: string;
}