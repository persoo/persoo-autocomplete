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

function getRedirectToHitLinkAction (link) {
    return function () {
        window.location = link;
    };
}

export default function createAutocompleteActions(store, inputConnector, caches) {
    const receiveHitsForIndex = [];
    for (let i = 0; i < store.getState().datasets.length; i++) {
        // bind actions for each index only once
        receiveHitsForIndex.push(receiveHits.bind(this, i));
    }
    // throttle request for people who type extremly fast
    const getSearchHitsThrottled = throttle(getSearchHits, store.getState().options.requestThrottlingInMs);


    /* helper functions */
    function updateQuery(query) {
        query = normalizeQuery(query);
        if (query != store.getState().query) {
            store.updateState({ query });  // ??? update state directly without re-render???
            getSearchHitsThrottled();
        }
    }

    function getSearchHits() {
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
                    receiveHits(i, searchResult);
                    if (DEBUG) { console.log('Serving query "' + query + '" from cache'); }
                } else {
                    // call external source to get hits for this dataset
                    store.setDatasetState(i, {searching: true, query: query});
                    let callback = receiveHitsForIndex[i];
                    state.options.datasets[i].source( query, callback);
                    if (DEBUG) { console.log('Sending query "' + query + '".'); }
                }
            } else {
                if (DEBUG) { console.log('Omitting query "' + query + '".'); }
            }
        }
    }
    function receiveHits(datasetIndex, searchResult) {
        const state = store.getState();
        let dataReceivedForQuery = state.datasets[datasetIndex].query;
        let currentQuery = state.query;

        // Note:  hits.map() for hits created in other iFrame returns undefined.
        // Thus we need create clone in js-context of new iFrame window.
        searchResult = JSON.parse(JSON.stringify(searchResult));
        searchResult.hits = searchResult.hits || [];
        searchResult.hitsCount = searchResult.hitsCount || 0;

        store.setDatasetState(datasetIndex,
                {hits: searchResult.hits, hitsCount: searchResult.hitsCount, searching: false},
                {selectedDataset: null, selectedHit: null});

        caches[datasetIndex].set(dataReceivedForQuery, searchResult);

        if (currentQuery != dataReceivedForQuery) {
            getSearchHitsThrottled();
        }
    }

    return {
        onResizeAction() {
            const {top, left, width} = inputConnector.getDropdownPosition();
            const options = store.getState().options;
            store.updateState({
                dropdownTop: top + options.offsetTop,
                dropdownLeft: left + options.offsetLeft,
                dropdownWidth: (options.width === 'input' ? width : options.width)
            });
        },
        onKeyDownAction(e) {
            let key = window.event ? e.keyCode : e.which;
            if ([KEYS.DOWN, KEYS.UP, KEYS.RIGHT, KEYS.LEFT].indexOf(key) >= 0 && inputConnector.getValue()) {
                // move cursor
                switch (key) {
                    case KEYS.DOWN:
                        store.moveToNextHit();
                        break;
                    case KEYS.UP:
                        store.moveToPreviousHit();
                        break;
                    case KEYS.RIGHT:
                        if (store.getSelectedHit() != null)
                            store.moveToNextHit();
                        break;
                    case KEYS.LEFT:
                        if (store.getSelectedHit() != null)
                            store.moveToPreviousHit();
                        break;
                    default:
                }
                return false;
            }
            else if (key == KEYS.ESC) {
                // hide dropdown
                store.updateState({dropdownIsVisible: false});
            }
            else if (key == KEYS.TAB && store.getSelectedHit() !== null) {
                // rotate datasets
                if (store.moveToNextDataset()) {
                   // TODO tab is strange, how to get rid of browser default tab behavior???
                   //e.stopPropagation();
                }
            }
            else if (key == KEYS.ENTER) {
                let selectedHit = store.getSelectedHit();
                if (selectedHit) {
                    // apply selected hit
                    if (DEBUG) { console.log("KeyDown action: " + key + " go to selected hit"); }
                    store.getState().options.onSelect(selectedHit, getRedirectToHitLinkAction(selectedHit.link));
                } else {
                    // default search action
                    if (DEBUG) { console.log("KeyDown action: " + key + " default search action/submit query"); }
                    store.updateState({dropdownIsVisible: false});
                }
            }
        },
        onKeyUpAction(e) {
            if (DEBUG) { console.log("KeyUp action: " + key); }

            let key = window.event ? e.keyCode : e.which;
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
            if (store.getState().options.closeOnBlur) {
                if (!store.getState().dropdownClickProcessing) {
                    store.updateState({dropdownIsVisible: false});
                } else {
                    // Prevent onBlur for clicks into Autocomplete Dropdown
                    inputConnector.setFocus();
                }
            }
            return true;
        },
        selectHitAction(datasetIndex, hitIndex) {
            store.updateState({selectedDataset: datasetIndex, selectedHit: hitIndex})
        },
        clickHitAction(datasetIndex, hitIndex, event) {
            if (DEBUG) { console.log('OnClick Hit Action'); }

            if (event.button == 0) { // Left mouse button only
                let selectedHit = store.getSelectedHit();
                store.getState().options.onSelect(selectedHit, getRedirectToHitLinkAction(selectedHit.link));
                store.updateState({selectedDataset: datasetIndex, selectedHit: hitIndex});
            }
        },
        clickDropdownAction() {
            // Note: trigger onMouseDown which is before onBlur
            //       used to prevent onBlur action
            store.updateState({dropdownClickProcessing: true});
            setTimeout(function() {
                store.updateState({dropdownClickProcessing: false});
            }, 1);
        }
    }
}
