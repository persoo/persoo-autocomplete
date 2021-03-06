import {addEvent, removeEvent, throttle} from 'utils';

const eventNames = ['keyDown', 'keyUp', 'resize', 'blur', 'focus'];

/**
 * Find the INPUT element by querySelector and provide methods for its listeners, values, positions.
 * @param {string} inputSelector - querySelector to fing the one input element to use as event source for suggest
 */
export default class PersooInputConnector {
    constructor(inputSelector) {
        this.inputSelector = inputSelector;
        this.inputElement = document.querySelector(this.inputSelector);
        if (!this.inputElement) {
            console.warn("PersooAutocompleteInput: cannot find input element" +
                        ` with selector "{$this.inputElementSelector}".`);
        }
    }

    destroy() {
        unlistenToEvents();
    }

    listenToEvents(eventHandlers) {
        for (let eventName of eventNames) {
            if (eventName == 'resize' && eventHandlers[eventName]) {
                addEvent(window, eventName.toLowerCase(), throttle(eventHandlers[eventName], 200, true));
            } else {
                addEvent(this.inputElement, eventName.toLowerCase(), eventHandlers[eventName]);
            }
        }
        this.eventHandlers = eventHandlers;
    }

    unlistenToEvents() {
        for (let eventName of eventNames) {
            if (eventHandlers[eventName] == 'resize') {
                removeEvent(window, eventName.toLowerCase(), eventHandlers[eventName]);
            } else {
                removeEvent(this.inputElement, eventName.toLowerCase(), eventHandlers[eventName]);
            }
        }
    }

    /* position for dropdown below input box */
    getDropdownPosition() {
        const rect = this.inputElement.getBoundingClientRect();
        const left = Math.round(rect.left + (window.pageXOffset || document.documentElement.scrollLeft));
        const top = Math.round(rect.bottom + (window.pageYOffset || document.documentElement.scrollTop));
        const width = Math.round(rect.right - rect.left); // outerWidth
        return {top, left, width};
    }

    getValue() {
        return this.inputElement.value;
    }
    setValue(str) {
        this.inputElement.value = str;
    }
    setFocus() {
        this.inputElement.focus();
    }
}
