import createStore from 'createStore';
import {mergeObjects, convertToReactComponent} from 'utils';

const defaultOptions = {
    minChars: 1,
    requestThrottlingInMs: 200,
    showEmptyResults: true, // show dropdown if there are no results in any dataset
    openOnFocus: true,
    closeOnBlur: true, // usefull for debugging
    datasets: [
       // using defaultDatasetOptions for each dataset
    ],
    offsetLeft: 0, // [in px] relatively to InputElement
    offsetTop: 1, // [in px] relatively to InputElement
    width: 'input', // [in px],  'input' means use width of the Input Element,
                   // null means do not set it in inline styles
    cssClasses: {
        // root: {}  // add CSS classes to autocompleteDropdown__root
    },
    onSelect: function(selectedHit){ // function onSelect(selectedHit) {}
        console.log('persooAutocomplete: selected hit is ' + JSON.stringify(selectedHit));
    },

    autocompleteID: 'persooAutocomplete',
    offerID: 'persooAutocomplete',
    locationID: 'persooAutocomplete',

    priceSuffix: '' // to display currency after price
};
const defaultDatasetOptions = {
    showWhenEmptyResults: true,
    templates: {},
    cssClasses: {}
};

export function getInitialState(optionsFromArgs) {
    const state = {
        options: null,
        query: null,

        dropdownIsVisible: false, // in having no hits, its no visible even if this flag is true
        dropdownTop: 0,
        dropdownLeft: 0,
        dropdownWidth: 0,

        datasets: [],
        selectedDataset: null,
        selectedHit: null
    };

    state.options = Object.assign({}, defaultOptions, optionsFromArgs);
    const options = state.options;
    options.datasets = options.datasets.map(
        (datasetOptions, i) => {
            let fullOptions = mergeObjects(Object.assign({index: i, id: i}, defaultDatasetOptions), datasetOptions);
            Object.keys(fullOptions.templates).map(
                 x => {fullOptions.templates[x] = convertToReactComponent(fullOptions.templates[x]);}
            );
            return fullOptions;
        }
    );

    const datasetInitialState = {
            hits: [],
            query: null, // query corresponding to hits
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

        hasHits() { // in any dataset
            let hasHits = false;
            store.getState().datasets.forEach(
                    dataset => {if (dataset.hits && dataset.hits.length > 0) {hasHits = true;}}
            );
            return hasHits;
        },

        getSelectedHit() {
            let {selectedDataset, selectedHit, datasets} = store.getState();
            if (selectedDataset != null && selectedHit != null) {
                return datasets[selectedDataset].hits[selectedHit];
            } else {
                return null;
            }
        },

        moveToNextHit() {
            if (this.hasHits()) {
                let {selectedDataset, selectedHit, datasets} = store.getState();

                if (selectedDataset == null) {
                    selectedDataset = 0;
                    selectedHit = 0;
                } else {
                    selectedHit++;
                }
                while (selectedHit >= datasets[selectedDataset].hits.length) {
                    selectedDataset = (selectedDataset + 1) % datasets.length;
                    selectedHit = 0;
                }
                store.updateState({selectedDataset, selectedHit});
            }
        },

        moveToPreviousHit() {
            if (this.hasHits()) {
                let {selectedDataset, selectedHit, datasets} = store.getState();

                if (selectedDataset == null) {
                    selectedDataset = datasets.length - 1;
                    selectedHit = datasets[selectedDataset].hits.length - 1;
                } else {
                    selectedHit--;
                }
                while (selectedHit < 0) {
                    selectedDataset = (selectedDataset - 1 + datasets.length) % datasets.length;
                    selectedHit = datasets[selectedDataset].hits.length - 1;
                }
                store.updateState({selectedDataset, selectedHit});
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
