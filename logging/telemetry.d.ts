/** Used for logging telemetry. */
export interface ITelemetry {
    /**
     * Log an event.
     * @param name The name of the event. e.g. 'SendLink'
     * @param properties The custom properties for the event.
     */
    trackEvent(name: string, properties?: { [name: string]: string; });
}