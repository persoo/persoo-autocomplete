import {addEvent, removeEvent, throttle} from 'utils';

const eventNames = ['keyDown', 'keyUp', 'resize', 'blur', 'focus'];

/**
 * Find INPUT element in the page and provide event listeners to manupulate with element.
 */
export default class PersooInputConnector {
    constructor(inputSelector) {
        this.inputSelector = inputSelector;
        this.inputElement = document.querySelector(this.inputSelector);
        if (!this.inputElement) {
            console.log("PersooAutocompleteInput: cannot find input element" +
                        ` with selector "{$this.inputElementSelector}".`);
        }
    }

    destroy() {
        unlistenToEvents();
    }

    listenToEvents(eventHandlers) {
        for (let eventName of eventNames) {
            if (eventHandlers[eventName] == 'resize') {
                addEvent(window, eventName.toLowerCase(), throttle(eventHandlers[eventName], 200));
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
}