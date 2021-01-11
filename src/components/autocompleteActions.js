import {normalizeQuery, throttle} from 'utils';

const KEYS = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40
};

// const DEBUG = true;

function getRedirectToItemLinkAction (link) {
    return function () {
        window.location.href = link;
    };
}

export default function createAutocompleteActions(store, inputConnector, caches) {
    const receiveItemsForIndex = [];
    for (let i = 0; i < store.getState().datasets.length; i++) {
        // bind actions for each index only once
        receiveItemsForIndex.push(receiveItems.bind(this, i));
    }
    // throttle request for people who type extremly fast
    const getSearchItemsThrottled = throttle(getSearchItems, store.getState().options.requestThrottlingInMs, false);
    let analyticsTimeoutID = null;


    /* helper functions */
    function updateQuery(query) {
        query = normalizeQuery(query);
        if (query != store.getState().query) {
            const queryLastModificationTimestamp = Date.now();
            store.updateState({ query, queryLastModificationTimestamp });  // ??? update state directly without re-render???
            getSearchItemsThrottled();

            sendVirtualPageviewIfStoppedTyping();
            store.getState().options.onQueryChanged({query: query});
        }
    }

    function sendVirtualPageviewIfStoppedTyping() {
        const state = store.getState();
        if (state.queryLastModificationTimestamp < Date.now() - state.options.analytics.triggerDelayInMs) {
            analyticsTimeoutID = null;
            state.options.analytics.pushFunction({ query: state.query, datasets: state.datasets });
        } else {
            if (analyticsTimeoutID != null) {
                clearTimeout(analyticsTimeoutID);
            }
            analyticsTimeoutID = setTimeout(sendVirtualPageviewIfStoppedTyping, state.options.analytics.triggerDelayInMs);
        }
    }
    function sendVirtualPageviewNow() {
        const state = store.getState();
        if (state.options.analytics.triggerOnClick) {
            const queryLastModificationTimestamp = Date.now();
            store.updateState({ queryLastModificationTimestamp }); // to count next delay from last reported pageview
            state.options.analytics.pushFunction({ query: state.query, datasets: state.datasets });
        }
    }

    function getSearchItems() {
        const state = store.getState();
        let datasetsCount = state.options.datasets.length;
        let query = state.query;
        for (let i = 0; i < datasetsCount; i++) {
            let datasetState = state.datasets[i];
            let searchResult = caches[i].get(query);
            if (!datasetState.searching) {
                if (searchResult) {
                    // take it from cache
                    store.setDatasetState(i, {query: query});
                    receiveItems(i, searchResult);
                    if (DEBUG) { console.log('Serving query "' + query + '" from cache'); }
                } else {
                    // call external source to get items for this dataset
                    store.setDatasetState(i, {searching: true, query: query});
                    let callback = receiveItemsForIndex[i];
                    state.options.datasets[i].source( query, callback);
                    if (DEBUG) { console.log('Sending query "' + query + '".'); }
                }
            } else {
                if (DEBUG) { console.log('Omitting query "' + query + '".'); }
            }
        }
    }
    function receiveItems(datasetIndex, searchResult) {
        const state = store.getState();
        let dataReceivedForQuery = state.datasets[datasetIndex].query;
        let currentQuery = state.query;

        // Note:  items.map() for items created in other iFrame returns undefined.
        // Thus we need create clone in js-context of new iFrame window.
        searchResult = JSON.parse(JSON.stringify(searchResult));
        searchResult.items = searchResult.items || [];
        searchResult.itemsCount = searchResult.itemsCount || 0;

        store.setDatasetState(datasetIndex,
                {items: searchResult.items, itemsCount: searchResult.itemsCount, searching: false},
                {selectedDataset: null, selectedItem: null});

        caches[datasetIndex].set(dataReceivedForQuery, searchResult);

        if (currentQuery != dataReceivedForQuery) {
            getSearchItemsThrottled();
        } else {
            checkIfDataReceived();
        }
    }

    /* wait for data for given query to be able to perfom custom js logic based on the data, i.e. redirect to item detail */
    function checkIfDataReceived() {
        const state = store.getState();
        if (state.waitingForDataRequests && store.hasDataReceived()) {
            /* data received, call callback */
            store.dataReceivedCallback();
            clearTimeout(store.dataReceivedCallbackTimer);
            store.updateState({waitingForDataRequests: false});
            return true;
        } else {
            /* not ready */
            return false;
        }
    }

    return {
        onResizeAction() {
            const {top, left, width} = inputConnector.getDropdownPosition();
            const options = store.getState().options;
            store.updateState({
                dropdownTop: options.offsetTop != null ? top + options.offsetTop : null,
                dropdownLeft: options.offsetTop != null ? left + options.offsetLeft : null,
                dropdownWidth: (options.width === 'input' ? width : options.width)
            });
        },
        onKeyDownAction(e) {
            let key = window.event ? e.keyCode : e.which;
            if ([KEYS.DOWN, KEYS.UP, KEYS.RIGHT, KEYS.LEFT].indexOf(key) >= 0 && inputConnector.getValue()) {
                // move cursor
                switch (key) {
                    case KEYS.DOWN:
                        store.moveToNextItem();
                        break;
                    case KEYS.UP:
                        store.moveToPreviousItem();
                        break;
                    case KEYS.RIGHT:
                        if (store.getSelectedItem() != null)
                            store.moveToNextItem();
                        break;
                    case KEYS.LEFT:
                        if (store.getSelectedItem() != null)
                            store.moveToPreviousItem();
                        break;
                    default:
                }
                return false;
            }
            else if (key == KEYS.ESC) {
                // hide dropdown
                store.updateState({dropdownIsVisible: false});
            }
            else if (key == KEYS.TAB && store.getSelectedItem() !== null) {
                // rotate datasets
                if (store.moveToNextDataset()) {
                   // TODO tab is strange, how to get rid of browser default tab behavior???
                   //e.stopPropagation();
                }
            }
            else if (key == KEYS.ENTER) {
                if (DEBUG) { console.log("KeyDown action: ENTER!!!"); }
                let selectedItem = store.getSelectedItem();
                if (selectedItem) {
                    // apply selected item
                    if (DEBUG) { console.log("KeyDown action: " + key + " go to selected item"); }
                    e.preventDefault(); // otherwise submit action will be send before url redirect
                    store.getState().options.onSelect(selectedItem, getRedirectToItemLinkAction(selectedItem.link));
                } else {
                    // default search action
                    if (DEBUG) { console.log("KeyDown action: " + key + " default search action/submit query"); }
                    store.updateState({dropdownIsVisible: false});
                }
            }
        },
        onKeyUpAction(e) {
            let key = window.event ? e.keyCode : e.which;
            if (DEBUG) { console.log("KeyUp action: " + key); }
            if (!key || (key < 35 || key > 40) && key != KEYS.ENTER && key != KEYS.ESC) {
                let value = inputConnector.getValue();
                if (value.length >= store.getState().options.minChars) {
                    updateQuery(value);
                    store.updateState({dropdownIsVisible: true});
                } else {
                    store.updateState({dropdownIsVisible: false});
                }
            }
        },
        onFocusAction() {
            if (store.getState().options.openOnFocus) {
                store.updateState({dropdownIsVisible: true});
            }
        },
        onBlurAction() {
            if (document.hasFocus() && store.getState().options.closeOnBlur) {
                if (!store.getState().dropdownClickProcessing) {
                    store.updateState({dropdownIsVisible: false});
                } else {
                    // Prevent onBlur for clicks into Autocomplete Dropdown
                    store.updateState({dropdownIsVisible: true});
                }
            }
            return true;
        },
        selectItemAction(datasetIndex, itemIndex, isEnabled = true) {
			if (isEnabled) {
            	store.updateState({selectedDataset: datasetIndex, selectedItem: itemIndex})
			}
        },
        clickItemAction(datasetIndex, itemIndex, event) {
            if (DEBUG) { console.log('OnClick Item Action'); }

            if (event.button == 0) { // Left mouse button only
                let selectedItem = store.getSelectedItem();
                store.getState().options.onSelect(selectedItem, getRedirectToItemLinkAction(selectedItem.link));
                store.updateState({selectedDataset: datasetIndex, selectedItem: itemIndex});
            }
            sendVirtualPageviewNow();
        },
        clickDropdownAction() {
            if (DEBUG) { console.log('OnClickDropdownAction'); }

            // Note: trigger onMouseDown which is before onBlur
            //       used to prevent onBlur action
            store.updateState({dropdownClickProcessing: true});
            setTimeout(function() {
                store.updateState({dropdownClickProcessing: false});
            }, 1);

            sendVirtualPageviewNow();
        },

        waitForDataReceived(maxWaitingTimeInMilis, callback) {
            let value = inputConnector.getValue();
            updateQuery(value);

            store.dataReceivedCallback = callback;
            if (!checkIfDataReceived()) {
                store.dataReceivedCallbackTimer = setTimeout(store.dataReceivedCallback, maxWaitingTimeInMilis);
                store.updateState({waitingForDataRequests: true});
            }
        }

    }
}
