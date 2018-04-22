import { ITelemetry } from "../logging/telemetry";

/**
 * Azure application insights implementation of telemetry.
 */
export class AppInsights implements ITelemetry {
    constructor(private readonly appInsights: any) { }

    trackEvent(name: string, properties?: { [name: string]: any; }) {
        this.appInsights.trackEvent({
            name: name,
            properties: properties
        });
    }
}