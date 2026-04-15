//------------------------------------------------------------------------------------
/**
 * Event Bus pattern. Uses native event listener methods.
 * @extends EventTarget
 */
//------------------------------------------------------------------------------------
class EventBus extends EventTarget {

    on(type, listener) {
        this.addEventListener(type, listener);
    }

    once(type, listener) {
        this.addEventListener(type, listener, { once: true });
    }

    off(type, listener) {
        this.removeEventListener(type, listener);
    }

    emit(type, data) {
        const customEvent = new CustomEvent(type, { detail: data });
        this.dispatchEvent(customEvent);
    }
}

export const eventBus = new EventBus();