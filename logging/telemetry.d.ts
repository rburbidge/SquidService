import { EventType } from "./event-type";

/** Used for logging telemetry. */
export interface ITelemetry {
    /**
     * Log an event.
     * @param eventType The event type.
     * @param properties The custom properties for the event.
     */
    trackEvent(eventType: EventType, properties?: { [name: string]: string; });
}