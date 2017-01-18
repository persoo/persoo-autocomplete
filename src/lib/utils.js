import { h, Component } from 'preact';

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
    // FIXME case when template is React Component
    return function(props) {
        const {className, style, onMouseEnter, onMouseDown, onMouseLeave} = props;
        return <div
            dangerouslySetInnerHTML={{__html: renderRawHTMLTemplate(props)}}
            {...{className, style, onMouseEnter, onMouseDown, onMouseLeave}}
        />;
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
        result = obj2 || obj1;
    }
    return result;
}

function normalizeQuery(str) {
    // strips leading whitespace and condenses all whitespace
    return (str || '').replace(/^\s*/g, '').replace(/\s{2,}/g, ' ');
}

function highlightTerms(str, terms, tagName) {
    // escape special characters
    terms = terms.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const re = new RegExp("(" + search.split(' ').join('|') + ")", "gi");
    return str.replace(re, "<" + tagName + ">$1</" + tagName + ">")
}
/**
 * Return compiled function for highlighting words from "terms" by wrapping matched terms in tagName.
 * I.e. highlight('hello', 'em') will produce '<em>hello</em> world' from 'hello world'.
 * @param {string} terms
 * @param {string} tagName
 */
function getHighlightingFunc(terms, tagName) {
    if (!terms) {
        return function (str) {return str;}
    }
    // escape special characters
    terms = terms.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp("(" + terms.split(' ').join('|') + ")", "gi");
    const replacement = "<" + tagName + ">$1</" + tagName + ">";

    return function(str) {
        return str.replace(regex, replacement);
    };
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

export {
    convertToReactComponent,
    getHighlightingFunc,

    addEvent,
    removeEvent,

    mergeObjects,
    normalizeQuery
}
