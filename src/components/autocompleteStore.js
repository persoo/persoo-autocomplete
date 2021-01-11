import createStore from 'createStore';
import {mergeObjects, convertToReactComponent} from 'utils';

const defaultOptions = {
    minChars: 1,
    requestThrottlingInMs: 200,
    openOnFocus: true,
    closeOnBlur: true, // usefull for debugging
	selectItemOnHover: true,
    datasets: [
       // using defaultDatasetOptions for each dataset
    ],
    offsetLeft: 0, // [in px] relatively to InputElement
    offsetTop: 1, // [in px] relatively to InputElement
    width: 'input', // [in px],  'input' means use width of the Input Element,
                   // null means do not set it in inline styles
    cssProps: {
        // root: {}  // add CSS classes to autocompleteDropdown__root
    },
    classNames: {
        // component.part, i.e. autocompleteDropdown.root
    },
    onSelect: function(selectedItem, redirectToItemLink){
        redirectToItemLink();
    },
    onQueryChanged: function() {}, // always existing default

    analytics: {
        pushFunction: function() {},
        triggerOnClick: true,
        triggerDelayInMs: 3000
    },

    showWhenAllResultsEmpty: false,

    autocompleteID: 'persooAutocomplete',
    offerID: 'persooAutocomplete',
    locationID: 'persooAutocomplete',

    priceSuffix: '' // to display currency after price
};
const defaultDatasetOptions = {
    showWhenEmptyResults: true,
    templates: {},
    classNames: {},
    cssProps: {}
};

export function getInitialState(optionsFromArgs) {
    const state = {
        options: null,
        query: null,
        queryLastModificationTimestamp: 0,

        dropdownIsVisible: false, // in having no items, its no visible even if this flag is true
        dropdownTop: 0,
        dropdownLeft: 0,
        dropdownWidth: 0,

        datasets: [],
        selectedDataset: null,
        selectedItem: null,

        waitingForDataRequests: false
    };

    state.options = Object.assign({}, defaultOptions, optionsFromArgs);
    const options = state.options;
    let showWhenEmptyResults = false;
    options.datasets = options.datasets.map(
        (datasetOptions, i) => {
            let fullOptions = mergeObjects(Object.assign({index: i, id: i}, defaultDatasetOptions), datasetOptions);
            Object.keys(fullOptions.templates).map(
                 x => {fullOptions.templates[x] = convertToReactComponent(fullOptions.templates[x]);}
            );
            if (fullOptions.showWhenEmptyResults) showWhenEmptyResults = true; // set global flag
            return fullOptions;
        }
    );
    state.showWhenEmptyResults = showWhenEmptyResults;
    state.showWhenAllResultsEmpty = state.options.showWhenAllResultsEmpty;
    state.useAnalytics = (state.options.analytics && typeof state.options.analytics.pushFunction == "function");

    if (state.options.noResultTemplate) {
        state.options.noResultTemplate = convertToReactComponent(state.options.noResultTemplate);
    }

    const datasetInitialState = {
            items: [],
            itemsCount: 0,
            query: null, // query corresponding to items
            searching: false
    };
    options.datasets.forEach(
            x => (state.datasets.push(Object.assign({}, datasetInitialState)))
    );

    return state;
}

// Note: we need to create independent store for each instance of autocomplete in a page
export function createAutocompleteStore(initialState) {

    // general store provides methods
    //     getState(),
    //     setState(nextState),
    //     updateState(increment),
    //     subscribe(listenerFunc)
    let store = createStore(initialState);

    /* custom methods working with store */
    return Object.assign(store, {

        hasItems() { // in any dataset
            let hasItems = false;
            store.getState().datasets.forEach(
                    dataset => {if (dataset.items && dataset.items.length > 0) {hasItems = true;}}
            );
            return hasItems;
        },
        hasDataReceived() {
            let hasData = true;
            const state = store.getState();
            const query = state.query;
            state.datasets.forEach(
                    dataset => {if (dataset.searching || dataset.query != query) {hasData = false;}}
            );
            return hasData;
        },

        getSelectedItem() {
            let {selectedDataset, selectedItem, datasets} = store.getState();
            if (selectedDataset != null && selectedItem != null) {
                return datasets[selectedDataset].items[selectedItem];
            } else {
                return null;
            }
        },

        moveToNextItem() {
            if (this.hasItems()) {
                let {selectedDataset, selectedItem, datasets} = store.getState();

                if (selectedDataset == null) {
                    selectedDataset = 0;
                    selectedItem = 0;
                } else {
                    selectedItem++;
                }
                while (selectedItem >= datasets[selectedDataset].items.length) {
                    selectedDataset = (selectedDataset + 1) % datasets.length;
                    selectedItem = 0;
                }
                store.updateState({selectedDataset, selectedItem});
            }
        },

        moveToPreviousItem() {
            if (this.hasItems()) {
                let {selectedDataset, selectedItem, datasets} = store.getState();

                if (selectedDataset == null) {
                    selectedDataset = datasets.length - 1;
                    selectedItem = datasets[selectedDataset].items.length - 1;
                } else {
                    selectedItem--;
                }
                while (selectedItem < 0) {
                    selectedDataset = (selectedDataset - 1 + datasets.length) % datasets.length;
                    selectedItem = datasets[selectedDataset].items.length - 1;
                }
                store.updateState({selectedDataset, selectedItem});
            }
        },

        /** return false if not moved in case of only 1 dataset */
        moveToNextDataset() {
            if (this.hasItems()) {
                let {selectedDataset, selectedItem, datasets} = store.getState();
                const originalDataset = selectedDataset;

                if (selectedDataset == null) {
                    selectedDataset = 0;
                    selectedItem = 0;
                } else {
                    selectedDataset = (selectedDataset + 1) % datasets.length;
                }
                while (selectedItem >= datasets[selectedDataset].items.length) {
                    selectedDataset = (selectedDataset + 1) % datasets.length;
                    selectedItem = 0;
                }

                if (originalDataset == null || originalDataset != selectedDataset) {
                    store.updateState({selectedDataset, selectedItem});
                    return true;
                } else {
                    return false;
                }
            }
        },

        // i.e. setDatasetState(1, {key1: val1, key2: val2}, {rootKey: val3})
        setDatasetState(index, datasetIncrement, rootStateIncrement) {
            let datasets = store.getState().datasets;
            for (let key in datasetIncrement) {
                datasets[index][key] = datasetIncrement[key];
            }
            store.updateState(Object.assign({ datasets }, rootStateIncrement));
        }
    });
}
