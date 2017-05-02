import { h, Component } from 'preact';
import { PureComponent } from 'react';
import EJS from 'persoo-templates/lib/embeddedjs'

import { getHighlightingFunc } from 'highlightUtils';
import Cache from 'cache';

/**
 * Convert simple HTML of result of template(props) call into React Component, which
 * can hold our classes, event listeners, ...
 * @param {string|function} template - HTML string or function retuning HTML string
 * @return {ReactComponent}
 */
function convertToReactComponent(template) {
    let renderTemplateFunction = template;
    if (typeof template == 'string') {
        if (template.indexOf('%>') >= 0) {
            // its EmbeddedJS template
            let ejsOptions = {
                escape: function (str) {return str;}
            };
            renderTemplateFunction = EJS.compile(template, ejsOptions);
        } else {
            // plain string
            renderTemplateFunction = function () { return template; };
        }
    }
    // Note: caching is not neccessary, each React Component (class) is defined
    // only once and remembers compiled template
    var TemplateComponent = class extends AbstractCustomTemplate {
        constructor(props) {
            super(renderTemplateFunction, props);
        }
    }
    return TemplateComponent;
}

class AbstractCustomTemplate extends PureComponent {
    constructor(renderTemplateFunction, props) {
        super(props);
        this.renderTemplateFunction = renderTemplateFunction;
    }
	render(props) {
        const {className, style, onMouseEnter, onMouseDown, onMouseLeave} = props;
        const rawHTML = this.renderTemplateFunction(props);
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
 * in case it was canceled during the interval. Use function arguments passed in the last call.
 * @param {function} callback
 * @param {number} limit in millis
 * @param {boolean} callOnLeadingEdgeToo ... call function on the leading edge of the interval, too.
 * @return {function} throttled function with the same arguments
 */
function throttle(callback, limit, callOnLeadingEdgeToo) {
    var callOnLeadingEdgeIndicator = callOnLeadingEdgeToo ? 1 : 0;
    var canceledCallsInInterval = 0;
    var lastArguments = null;
    var lastThis = null;
    return function () {
        lastThis = this;
        lastArguments = arguments;
        if (!canceledCallsInInterval) {
            if (callOnLeadingEdgeToo) {
                callback.apply(lastThis, lastArguments);
            }
            canceledCallsInInterval = 1;
            setTimeout(function () {
                if (canceledCallsInInterval > callOnLeadingEdgeIndicator) {
                    callback.apply(lastThis, lastArguments);
                }
                canceledCallsInInterval = 0;
            }, limit);
        } else {
            canceledCallsInInterval++;
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
