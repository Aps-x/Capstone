import { eventBus } from '../../core/EventBus.js';
import { EVENTS } from '../../core/Events.js';
//------------------------------------------------------------------------------------
/**
 * Displays notification messages to the user. Cracking toast, Gromit!
 * @extends HTMLElement
 */
//------------------------------------------------------------------------------------
class Toaster extends HTMLElement {
    static styles = new CSSStyleSheet();

    constructor() {
        super();
        eventBus.on(EVENTS.SYSTEM_MESSAGE_GENERATED, (event) => this.#handleNotificationIssued(event));
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

//------------------------------------------------------------------------------------
// Styles
//------------------------------------------------------------------------------------
Toaster.styles.replaceSync(/*css*/`
    .toaster {
        position: fixed;
        z-index: var(--z-toast);
        inset-block-end: 0;
        inset-inline: 0;
        padding-block-end: 5vh;
        display: grid;
        justify-items: center;
        justify-content: center;
        gap: 1vh;
        pointer-events: none;
    }
    .toaster__toast {
        --_duration: 3s;
        --_bg-lightness: 90%;
        --_travel-distance: 0;
        color: light-dark(var(--clr-slate-900), var(--clr-white));
        background-color: light-dark(var(--clr-white), var(--clr-slate-800));
        text-align: center;
        word-break: break-word;
        max-inline-size: min(25ch, 90vw);
        padding-block: 0.5ch;
        padding-inline: 1ch;
        border-radius: 100vmax;
        font-size: var(--fs-050);
        text-wrap: balance;
        will-change: transform;
        animation: fade-in 0.3s ease, slide-in 0.3s ease, fade-out 0.3s ease var(--_duration);
    }
    @media (--motionOK) {
        .toaster__toast {
            --_travel-distance: 5vh;
        }
    }
    @keyframes fade-in {
        from {
            opacity: 0;
        }
    }
    @keyframes fade-out {
        to {
            opacity: 0;
        }
    }
    @keyframes slide-in {
        from {
            transform: translateY(var(--_travel-distance, 10px));
        }
    }
`);

if (!document.adoptedStyleSheets.includes(Toaster.styles)) {
    document.adoptedStyleSheets.push(Toaster.styles);
}