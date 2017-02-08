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
            let hits = caches[i].get(query);
            if (!datasetState.searching) {
                if (hits) {
                    // take it from cache
                    store.setDatasetState(i, {query: query});
                    receiveHits(i, hits);
                    console.log('Serving query "' + query + '" from cache');
                } else {
                    // call external source to get hits for this dataset
                    store.setDatasetState(i, {searching: true, query: query});
                    let callback = receiveHitsForIndex[i];
                    state.options.datasets[i].source( query, callback);
                    console.log('Sending query "' + query + '".');
                }
            } else {
                console.log('Omitting query "' + query + '".');
            }
        }
    }
    function receiveHits(datasetIndex, hits) {
        const state = store.getState();
        let dataReceivedForQuery = state.datasets[datasetIndex].query;
        let currentQuery = state.query;

        // Note:  hits.map() for hits created in other iFrame returns undefined.
        // Thus we need create clone in js-context of new iFrame window.
        hits = JSON.parse(JSON.stringify(hits)) || [];

        store.setDatasetState(datasetIndex,
                {hits: hits, searching: false},
                {selectedDataset: null, selectedHit: null});

        caches[datasetIndex].set(dataReceivedForQuery, hits);

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
        onFocusAction() {
            if (store.getState().options.openOnFocus) {
                store.updateState({dropdownIsVisible: true});
            }
        },
        onBlurAction() {
            if (store.getState().options.closeOnBlur) {
                store.updateState({dropdownIsVisible: false});
            }
        },
        onKeyDownAction(e) {
            let key = window.event ? e.keyCode : e.which;
            if ((key == KEYS.DOWN || key == KEYS.UP) && inputConnector.getValue()) {
                // move cursor
                if (key == KEYS.DOWN) {
                    store.moveToNextHit();
                } else {
                    store.moveToPreviousHit();
                }
                return false;
            }
            else if (key == KEYS.ESC) {
                // hide dropdown
                store.updateState({dropdownIsVisible: false});
            }
            else if (key == KEYS.ENTER || key ==  KEYS.TAB) {
                let selectedHit = store.getSelectedHit();
                if (selectedHit) {
                    // apply selected hit
                    store.getState().options.onSelect(selectedHit);
                } else {
                    // default search action
                }
                store.updateState({dropdownIsVisible: false});
            }
        },
        onKeyUpAction(e) {
            let key = window.event ? e.keyCode : e.which;
            console.log(key);
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
        selectHitAction(datasetIndex, hitIndex) {
            store.updateState({selectedDataset: datasetIndex, selectedHit: hitIndex})
        },
        clickHitAction(datasetIndex, hitIndex) {
            store.getState().options.onSelect(store.getSelectedHit());
            store.updateState({selectedDataset: datasetIndex, selectedHit: hitIndex, dropdownIsVisible: false});
        }
    }
}
