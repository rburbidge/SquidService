import { ITelemetry } from "../logging/telemetry";
import { EventType } from "../logging/event-type";

/**
 * Azure application insights implementation of telemetry.
 */
export class AppInsights implements ITelemetry {
    constructor(private readonly appInsights: any) { }

    trackEvent(eventType: EventType, properties?: { [name: string]: any; }) {
        this.appInsights.trackEvent({
            name: eventType,
            properties: properties
        });
    }
}