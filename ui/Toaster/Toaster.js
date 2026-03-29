import { EVENT_BUS } from '../../core/EventBus.js';
import { EVENTS } from '../../core/Events.js';
//------------------------------------------------------------------------------------
/**
 * Displays notification messages to the user. Cracking toast, Gromit!
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Toaster extends HTMLElement {

    constructor() {
        super();
        EVENT_BUS.on(EVENTS.NOTIFICATION_ISSUED, (event) => this.#handleNotificationIssued(event));
    }

    connectedCallback() {
        this.classList.add('toaster');
    }

    /**
     * Orchestrates the lifecycle of a single toast notification.
     * Extracts text, creates the DOM element, triggers insertion/animation, 
     * and handles cleanup once animations complete.
     * @param {Event} event The event containing the notification text.
     * @returns {Promise<void>} Resolves when the toast's exit animations have finished and it is removed from the DOM.
     */
    async #handleNotificationIssued(event) {
        const text = event.detail;

        if (typeof text !== 'string' || text.trim() === '') {
            console.warn('Toaster: Notification ignored because of invalid string: ', text);
            return; 
        }

        const toast = this.#createToast(text);
        this.#addToast(toast);

        return new Promise(async (resolve) => {
            // Wait for all animations on the toast to finish
            await Promise.allSettled(
                toast.getAnimations().map(animation => animation.finished)
            );

            // Clean up DOM and resolve
            if (this.contains(toast)) {
                this.removeChild(toast);
            }
            resolve();
        });
    }

    /**
     * Constructs the DOM element for a new toast notification.
     * @param {string} text The message to display inside the toast.
     * @returns {HTMLOutputElement} The output element containing the toast text.
     */
    #createToast(text) {
        const toast = document.createElement('output');
        toast.innerText = text;

        toast.classList.add('toaster__toast');
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        return toast;
    }


    /**
     * Appends the toast to the DOM.
     * @param {HTMLElement} toast The toast element to add to the container.
     */
    #addToast(toast) {
        const { matches: motionOK } = window.matchMedia(
            '(prefers-reduced-motion: no-preference)'
        );

        if (this.children.length && motionOK) {
            this.#flipToast(toast);
        } 
        else {
            this.appendChild(toast);
        }
    }

    /**
     * Uses the FLIP (First, Last, Invert, Play) technique to smoothly animate 
     * the toaster container when a new toast is appended, preventing jarring layout shifts.
     * @param {HTMLElement} toast The new toast element being added.
     */
    #flipToast(toast) {
        // FIRST
        const first = this.offsetHeight;

        // add new child to change container size
        this.appendChild(toast);

        // LAST
        const last = this.offsetHeight;

        // INVERT
        const invert = last - first;

        // PLAY
        const animation = this.animate([
            { transform: `translateY(${invert}px)` },
            { transform: 'translateY(0)' }
        ], {
            duration: 150,
            easing: 'ease-out',
        });

        animation.startTime = document.timeline.currentTime;
    }
}

customElements.define('toaster-x', Toaster);