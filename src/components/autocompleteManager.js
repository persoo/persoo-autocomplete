import { h, Component } from 'preact';
import { Router } from 'preact-router';

import AutocompleteDropdown from './autocompleteDropdown';
import PersooInputConnector from './InputConnector';
import {mergeObjects, normalizeQuery, convertToReactComponent} from 'utils';
import Cache from 'cache';

require('offline-plugin/runtime').install();

const KEY = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        LEFT: 37,
        RIGHT: 39,
        UP: 38,
        DOWN: 40
};

const defaultOptions = {
    minChars: 1,
    showEmptyResults: true, // show dropdown if there are no results in any dataset
    openOnFocus: true,
    closeOnBlur: false, // usefull for debugging // FIXME set to true
    datasets: [],
    offsetLeft: 0, // [in px] relatively to InputElement
    offsetTop: 1, // [in px] relatively to InputElement
    width: null, // [in px] null means use width of the Input Element
    cssClasses: {
        // root: {}  // add CSS classes to autocompleteDropdown__root
    },
    onSelect: function(selectedHit){ // function onSelect(selectedHit) {}
        console.log('persooAutocomplete: selected hit is ' + JSON.stringify(selectedHit));
    },

    offerID: 'persooAutocomplete',
    locationID: 'persooAutocomplete'
};

export default class AutocompleteManager extends Component {
    constructor(args) {
        super(args);

        this._initOptions(args);

        // state is like a store
        this.state = {
            query: null,

            dropdownIsVisible: false, // in having no hits, its no visible even if this flag is true
            dropdownTop: 0,
            dropdownLeft: 0,
            dropdownWidth: 0,

            selectedDataset: null,
            selectedHit: null,
        };
        this._initDatasetsState();

        this.inputSelector = args.inputSelector;
    }
    _initOptions(args) {
        if (typeof args.options == 'undefined' || typeof args.inputSelector == 'undefined') {
            console.warn('PersooAutocomplete(inputSelector, options) requires two arguments.');
            return;
        }
        // options merged with defaults
        this.options = Object.assign(defaultOptions, args.options);
        const defaultDatasetOptions = {
                templates: {},
                cssClasses: {}
        };
        this.options.datasets = this.options.datasets.map(
                datasetOptions => mergeObjects(defaultDatasetOptions, datasetOptions)
        );

        this.caches = [];
        this.receiveHitsActionsForIndex = [];
        for (let i = 0; i < this.options.datasets.length; i++) {
            let dataset = this.options.datasets[i];
            dataset.index = i;
            // convert all string templates to react templates
            Object.keys(dataset.templates).map(
                 x => (dataset.templates[x] = convertToReactComponent(dataset.templates[x]))
            );
            // bind actions for each only once
            this.receiveHitsActionsForIndex.push(this.receiveHitsAction.bind(this, i));

            this.caches.push( new Cache() );
        }
    }
    _initDatasetsState() {
        const datasetInitialState = {
                hits: [],
                hitsForQuery: null,
                searching: false
        };
        this.state.datasets = [];
        this.options.datasets.forEach(
                x => (this.state.datasets.push(Object.assign(datasetInitialState)))
        );
    }

    componentWillMount() {
        this.inputConnector = new PersooInputConnector(this.inputSelector);
        this.inputConnector.listenToEvents({
            keyDown: ::this.onKeyDownAction,
            keyUp: ::this.onKeyUpAction,
            resize: ::this.onResizeAction,
            focus: ::this.onFocusAction,
            blur: ::this.onBlurAction
        });
        this.onResizeAction();
        this.caches.forEach( cache => (cache.reset()));
    }
    componentWillUnmount() {
        this.inputConnector.destroy();
    }

    /* Actions */

    onResizeAction() {
        const {top, left, width} = this.inputConnector.getDropdownPosition();
        this.setState({
            dropdownTop: top + this.options.offsetTop,
            dropdownLeft: left + this.options.offsetLeft,
            dropdownWidth: this.options.width || width
        });
    }
    onFocusAction() {
        if (this.options.openOnFocus) {
            this.setState({dropdownIsVisible: true});
        }
    }
    onBlurAction() {
        if (this.options.closeOnBlur) {
            this.setState({dropdownIsVisible: false});
        }
    }
    selectHitAction(datasetIndex, hitIndex) {
        this.setState({selectedDataset: datasetIndex, selectedHit: hitIndex})
    }
    clickHitAction(datasetIndex, hitIndex) {
        this.setState({selectedDataset: datasetIndex, selectedHit: hitIndex, dropdownIsVisible: false});
        this.options.onSelect(this.getSelectedHit());
    }
    onKeyDownAction(e) {
        let key = window.event ? e.keyCode : e.which;
        if ((key == KEY.DOWN || key == KEY.UP) && this.inputConnector.getValue()) {
            // move cursor
            if (key == KEY.DOWN) {
                this.moveToNextHit();
            } else {
                this.moveToPreviousHit();
            }
            return false;
        }
        else if (key == KEY.ESC) {
            // hide dropdown
            this.setState({dropdownIsVisible: false});
        }
        else if (key == KEY.ENTER || key ==  KEY.TAB) {
            let selectedHit = this.getSelectedHit();
            if (selectedHit) {
                // apply selected hit
                this.options.onSelect(selectedHit);
            } else {
                // default search action
            }
            this.setState({dropdownIsVisible: false});
        }
    }
    onKeyUpAction(e) {
        let key = window.event ? e.keyCode : e.which;
        console.log(key);
        if (!key || (key < 35 || key > 40) && key != KEY.ENTER && key != KEY.ESC) {
            let value = this.inputConnector.getValue();
            if (value.length >= this.options.minChars) {
                this.updateQuery(value);
                this.setState({dropdownIsVisible: true});
            } else {
                this.setState({dropdownIsVisible: false});
            }
        }
    }

    receiveHitsAction(datasetIndex, hits) {
        let dataReceivedForQuery = this.state.datasets[datasetIndex].query;
        let currentQuery = this.state.query;
        hits = hits || [];

        this.setDatasetState(datasetIndex,
                {hits: hits, searching: false},
                {selectedDataset: null, selectedHit: null});


        this.caches[datasetIndex].set(dataReceivedForQuery, hits);

        if (currentQuery != dataReceivedForQuery) {
            this.getSearchHits();
        }
    }

    /* helper functions */

    updateQuery(query) {
        query = normalizeQuery(query);
        if (query != this.state.query) {
            this.setState({ query });  // ??? update state directly without re-render???
            this.getSearchHits();
        }
    }
    getSelectedHit() {
        let {selectedDataset, selectedHit, datasets} = this.state;
        if (selectedDataset != null && selectedHit != null) {
            return datasets[selectedDataset].hits[selectedHit];
        } else {
            return null;
        }
    }
    moveToNextHit() {
        if (this.hasHits()) {
            let {selectedDataset, selectedHit, datasets} = this.state;

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
            this.setState({selectedDataset, selectedHit});
        }
    }

    moveToPreviousHit() {
        if (this.hasHits()) {
            let {selectedDataset, selectedHit, datasets} = this.state;

            if (selectedDataset == null) {
                selectedDataset = datasets.length - 1;
                selectedHit = datasets[selectedDataset].hits.length - 1;
            } else {
                selectedHit--;
            }
            while (selectedHit < 0) {
                selectedDataset = (selectedDataset - 1) % datasets.length;
                selectedHit = datasets[selectedDataset].hits.length - 1;
            }
            this.setState({selectedDataset, selectedHit});
        }
    }


    // i.e. setDatasetState(1, {key1: val1, key2: val2}, {rootKey: val3})
    setDatasetState(index, datasetIncrement, rootStateIncrement) {
        let datasets = this.state.datasets;
        for (let key in datasetIncrement) {
            datasets[index][key] = datasetIncrement[key];
        }
        this.setState(Object.assign({ datasets }, rootStateIncrement));
    }

    getSearchHits() {
        let datasetsCount = this.options.datasets.length;
        let query = this.state.query;
        for (let i = 0; i < datasetsCount; i++) {
            let datasetState = this.state.datasets[i];
            let hits = this.caches[i].get(query);
            if (!datasetState.searching) {
                if (hits) {
                    // take it from cache
                    this.setDatasetState(i, {query: query});
                    this.receiveHitsAction(i, hits);
                    console.log('Serving query "' + query + '" from cache');
                } else {
                    // call external source to get hits for this dataset
                    this.setDatasetState(i, {searching: true, query: query});
                    let callback = this.receiveHitsActionsForIndex[i];
                    this.options.datasets[i].source( query, callback);
                    console.log('Sending query "' + query + '".');
                }
            } else {
                console.log('Omitting query "' + query + '".');
            }
        }
    }

    hasHits() { // in any dataset
        let hasHits = false;
        this.state.datasets.forEach(
                dataset => {if (dataset.hits && dataset.hits.length > 0) {hasHits = true;}}
        );
        return hasHits;
    }

    render() {
        console.log("Re-rendering autocomplete.");

        const options = this.options;
        const state = this.state;

        const {dropdownTop, dropdownLeft, dropdownWidth, dropdownIsVisible} = this.state;
        const dropdownStyle = {
            top: dropdownTop + 'px',
            left: dropdownLeft + 'px',
            width: dropdownWidth + 'px',
        }
        const customCss = options.cssClasses.root;

        return (
            <AutocompleteDropdown
                offerID={options.offerID}
                locationID={options.locationID}
                isVisible={dropdownIsVisible && (this.hasHits() || options.showEmptyResults)}
                query={state.query}
                datasetsState={state.datasets}
                datasetsOptions={options.datasets}
                selectedDataset={state.selectedDataset}
                selectedHit={state.selectedHit}
                style={customCss ? Object.assign(customCss, dropdownStyle) : dropdownStyle}
                selectHitAction={::this.selectHitAction}
                clickHitAction={::this.clickHitAction}
            />
        );
    }
}
