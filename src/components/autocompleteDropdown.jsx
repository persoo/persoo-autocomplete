import { h, Component } from 'preact';
import PropTypes from 'proptypes';
import AutocompleteDataset from './autocompleteDataset';
import classNames from 'classNames';

const cx = classNames();

const defaultStyle = {
        position: "absolute",
        "z-index": 9999
};

class AutocompleteDropdown extends Component {

    render() {
        const {offerID, locationID, autocompleteID, query, priceSuffix,
                selectedDataset, selectedItem, datasetsOptions, datasetsState,
                selectItemAction, clickItemAction, clickDropdownAction,
                isVisible, classNames, style} = this.props;
        let {className} = {...cx('persoo-autocompleteDropdown__root', offerID)};
        className += ' persooLocation persooAction';
        className += ' ' + classNames.root;

        return (isVisible &&
            <div
                id={autocompleteID}
                className={className}
                style={Object.assign({}, defaultStyle, style)}
                data-offerID={offerID}
                data-locationID={locationID}
                onMouseLeave={selectItemAction.bind(null, null, null)}
                onMouseDown={clickDropdownAction}
            >
                {
                    datasetsOptions.map( (dataset, index) => (
                        canShowDataset(datasetsOptions, datasetsState, index) &&
                        <AutocompleteDataset
                            items={datasetsState[index].items}
                            itemsCount={datasetsState[index].itemsCount}
                            selectedItem={selectedDataset == index ? selectedItem : -1}
                            datasetIndex={index}
                            datasetID={datasetsOptions[index].id}
                            templates={datasetsOptions[index].templates}
                            classNames={datasetsOptions[index].classNames}
                            cssProps={datasetsOptions[index].cssProps}
                            {...{query, priceSuffix, selectItemAction, clickItemAction}}
                        />
                    ))
                }
            </div>
        );
    }
}

function canShowDataset(datasetsOptions, datasetsState, index) {
    const items = datasetsState[index].items;
    return (datasetsOptions[index].showWhenEmptyResults || (items && items.length > 0));
}

AutocompleteDropdown.propTypes = {
    autocompleteID: PropTypes.string,
    offerID: PropTypes.string,
    locationID: PropTypes.string,
    isVisible: PropTypes.boolean,
    datasetsOptions: PropTypes.array,
    datasetsState: PropTypes.array,
    selectedDataset: PropTypes.number,
    selectedItem: PropTypes.number,
    selectItemAction: PropTypes.func,
    clickItemAction: PropTypes.func,
    style: PropTypes.object
};

export default AutocompleteDropdown;
