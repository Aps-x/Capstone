//------------------------------------------------------------------------------------
/**
 * Event Bus pattern. Uses native event listener methods.
 * 
 * @extends EventTarget
 */
//------------------------------------------------------------------------------------
class EventBus extends EventTarget {
    /**
     * Adds an event listener
     * @param {EVENTS} type - The event to listen for.
     * @param {Function} listener - The callback function.
     */
    on(type, listener) {
        this.addEventListener(type, listener);
    }

    /**
     * Adds a one-time event listener.
     * @param {EVENTS} type - The event to listen for.
     * @param {Function} listener - The callback function.
     */
    once(type, listener) {
        this.addEventListener(type, listener, { once: true });
    }

    /**
     * Removes a registered event listener.
     * @param {EVENTS} type - The event to remove the listener from.
     * @param {EventListenerOrEventListenerObject|Function} listener - The callback function to remove.
     */
    off(type, listener) {
        this.removeEventListener(type, listener);
    }

    /**
     * Emits a custom event, triggering all registered listeners.
     * @param {EVENTS} type - The event to emit.
     * @param {*} [data] - Optional data payload to pass to the listeners via `event.detail`.
     */
    emit(type, data) {
        const customEvent = new CustomEvent(type, { detail: data });
        this.dispatchEvent(customEvent);
    }
}

export const EVENT_BUS = new EventBus();