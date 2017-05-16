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
        this.unsubcribe = this.store.subscribe(::this._updateLocalStateFromStore);
    }

    _updateLocalStateFromStore() {
        this.setState(this.store.getState());
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

        const options = this.store.getState().options;
        if (options.offsetTop != null || options.offsetLeft != null || options.width != null) {
            this.refreshFunctionTimerID = setInterval(this.actions.onResizeAction.bind(this), 1000);
        }
    }

    componentWillUnmount() {
        this.inputConnector.destroy();
        if (this.refreshFunctionTimerID) {
            clearInterval(this.refreshFunctionTimerID);
        }
    }

    render() {
        const state = this.store.getState();
        const options = state.options;

        const {dropdownTop, dropdownLeft, dropdownWidth, dropdownIsVisible, showWhenEmptyResults} = this.state;
        let dropdownStyle = {};
        if (dropdownTop !== null && dropdownLeft !== null) {
            dropdownStyle.top = dropdownTop + 'px',
            dropdownStyle.left = dropdownLeft + 'px'
        }
        if (dropdownWidth !== null) {
            dropdownStyle.width = dropdownWidth + 'px';
        }
        const customCss = options.cssProps.root;
        const isVisible = dropdownIsVisible && (this.store.hasItems() || (showWhenEmptyResults && state.query != null));

        if (typeof options.onRender == 'function') {
            options.onRender(isVisible);
        }

        return (
            <AutocompleteDropdown
                autocompleteID={options.autocompleteID}
                offerID={options.offerID}
                locationID={options.locationID}
                priceSuffix={options.priceSuffix}
                isVisible={isVisible}
                query={state.query}
                datasetsState={state.datasets}
                datasetsOptions={options.datasets}
                selectedDataset={state.selectedDataset}
                selectedItem={state.selectedItem}
                classNames={options.classNames}
                style={customCss ? Object.assign({}, customCss, dropdownStyle) : dropdownStyle}
                selectItemAction={this.actions.selectItemAction}
                clickItemAction={this.actions.clickItemAction}
                clickDropdownAction={this.actions.clickDropdownAction}
            />
        );
    }
}
