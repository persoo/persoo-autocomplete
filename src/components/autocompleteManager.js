import { h, Component } from 'preact';
import { Router } from 'preact-router';

import {getInitialState, createAutocompleteStore} from './autocompleteStore'
import createAutocompleteActions from './autocompleteActions';
import AutocompleteDropdown from './autocompleteDropdown';
import PersooInputConnector from './InputConnector';

import Cache from 'cache';

require('offline-plugin/runtime').install();

export default class AutocompleteManager extends Component {
    constructor(args) {
        super(args);

        if (typeof args.options == 'undefined' || typeof args.inputSelector == 'undefined') {
            console.warn('PersooAutocomplete(inputSelector, options) requires two arguments.');
            return;
        }
        this.inputSelector = args.inputSelector;

        // Note: we need different store for each "autocomplete" instance in a page
        this.store = createAutocompleteStore(getInitialState(args.options));
        this.unsubcribe = this.store.subscribe(() => (this.setState(this.store.getState())) );
    }

    _resetCaches() {
        this.caches = [];
        for (let i = 0; i < this.store.getState().datasets.length; i++) {
            this.caches.push( new Cache() );
        }
    }

    componentWillMount() {
        this._resetCaches();
        this.inputConnector = new PersooInputConnector(this.inputSelector);
        this.actions = createAutocompleteActions(this.store, this.inputConnector, this.caches);
        this.inputConnector.listenToEvents({
            keyDown: this.actions.onKeyDownAction,
            keyUp: this.actions.onKeyUpAction,
            resize: this.actions.onResizeAction,
            focus: this.actions.onFocusAction,
            blur: this.actions.onBlurAction
        });
        this.actions.onResizeAction();
    }

    componentWillUnmount() {
        this.inputConnector.destroy();
    }

    render() {
        console.log("Re-rendering autocomplete.");

        const state = this.store.getState();
        const options = state.options;


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
                isVisible={dropdownIsVisible && (this.store.hasHits() || options.showEmptyResults)}
                query={state.query}
                datasetsState={state.datasets}
                datasetsOptions={options.datasets}
                selectedDataset={state.selectedDataset}
                selectedHit={state.selectedHit}
                style={customCss ? Object.assign(customCss, dropdownStyle) : dropdownStyle}
                selectHitAction={this.actions.selectHitAction}
                clickHitAction={this.actions.clickHitAction}
            />
        );
    }
}
