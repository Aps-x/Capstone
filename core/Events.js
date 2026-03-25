//------------------------------------------------------------------------------------
/**
 * Application-wide event constants used by the EventBus.
 * Use these to prevent typos when dispatching or listening for events.
 * @enum {string}
 */
//------------------------------------------------------------------------------------
export const EVENTS = Object.freeze({
    MAP_SETTINGS_UPDATED: 'map-settings-updated',
    COLOR_SCHEME_UPDATED: 'color-scheme-updated',
    MAP_MARKER_CLICKED: 'map-marker-clicked',
});