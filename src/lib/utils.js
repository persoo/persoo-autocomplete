import { h, Component } from 'preact';
import { PureComponent } from 'react';
import { getHighlightingFunc } from 'highlightUtils';
import Cache from 'cache';

/**
 * Convert simple HTML of result of template(props) call into React Component, which
 * can hold our classes, event listeners, ...
 * @param {string|function} template - HTML string or function retuning HTML string
 * @return {ReactComponent}
 */
function convertToReactComponent(template) {
    // TODO use some templating engine, i.e. Hogan
    let renderRawHTMLTemplate = template;
    if (typeof template == 'string') {
        renderRawHTMLTemplate = function () {return template};
    }
    var TemplateComponent = class extends AbstractCustomTemplate {
        constructor(props) {
            super(renderRawHTMLTemplate, props);
        }
    }
    return TemplateComponent;
}

class AbstractCustomTemplate extends PureComponent {
    constructor(renderRawHTMLTemplate, props) {
        super(props);
        this.renderRawHTMLTemplate = renderRawHTMLTemplate;
    }
	render(props) {
        const {className, style, onMouseEnter, onMouseDown, onMouseLeave} = props;
        const rawHTML = this.renderRawHTMLTemplate(props);
        if (rawHTML) {
            return <div
                dangerouslySetInnerHTML={{__html: rawHTML}}
                {...{className, style, onMouseEnter, onMouseDown, onMouseLeave}}
            />;
        } else {
            return null;
        }
    }
}

function addEvent(element, type, handler) {
    if (element.attachEvent) {
        element.attachEvent('on'+type, handler); // for IE8 and older
    } else {
        element.addEventListener(type, handler);
    }
}
function removeEvent(element, type, handler) {
    if (element.detachEvent) {
        element.detachEvent('on'+type, handler);
    } else {
        element.removeEventListener(type, handler);
    }
}

function mergeObjects(obj1, obj2) {
    let result;
    if (typeof obj1 == 'object') {
        result = Object.assign({}, obj1);
        if (typeof obj2 == 'object') {
            for (let prop in obj2) {
                result[prop] = mergeObjects(obj1[prop], obj2[prop]);
            }
        }
    } else {
        result = (typeof obj2 !== 'undefined') ? obj2 : obj1;
    }
    return result;
}

function normalizeQuery(str) {
    // strips leading whitespace and condenses all whitespace
    return (str || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
}

/**
 * Call callback() at most once in time interval. Call callback() at the end of interval
 * in case it was canceled during the interval.
 * @param {function} callback
 * @param {number} limit in millis
 * @return {function} throttled function with the same arguments
 */
function throttle(callback, limit) {
    var wait = false;
    var haveCanceledCallInInterval = false;
    return function () {
        var myThis = this;
        var myArguments = arguments; // remember last used arguments
        if (!wait) {
            callback.apply(myThis, myArguments);
            wait = true;
            setTimeout(function () {
                wait = false;
                if (haveCanceledCallInInterval) {
                    callback.apply(myThis, myArguments);
                }
                haveCanceledCallInInterval = false;
            }, limit);
        } else {
            haveCanceledCallInInterval = true;
        }
    }
}

let highlightingCache = new Cache();

function getCachedHighlightingFunc(query, elementName) {
    const key = JSON.stringify({q:query, e:elementName});
    let f = highlightingCache.get(key);
    if (!f) {
        f = getHighlightingFunc(query, elementName);
        highlightingCache.set(key, f);
    }
    return f;
}

export {
    getCachedHighlightingFunc,

    convertToReactComponent,

    addEvent,
    removeEvent,

    mergeObjects,
    normalizeQuery,

    throttle
}
