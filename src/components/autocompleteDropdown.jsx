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

        let datasetGroups = splitDatasetsToGroups(datasetsOptions);

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
                    datasetGroups.map( (group) => {
                        let innerComponents = group.datasets.map( (dataset) => {
                            let index = dataset.index;
                            if (canShowDataset(datasetsOptions, datasetsState, dataset.index)) {
                                return <AutocompleteDataset
                                    items={datasetsState[index].items}
                                    itemsCount={datasetsState[index].itemsCount}
                                    selectedItem={selectedDataset == index ? selectedItem : -1}
                                    datasetIndex={index}
                                    datasetID={datasetsOptions[index].id}
                                    templates={datasetsOptions[index].templates}
                                    classNames={datasetsOptions[index].classNames}
                                    cssProps={datasetsOptions[index].cssProps}
                                    {...{query, priceSuffix, selectItemAction, clickItemAction}}
                                />;
                            } else {
                                return null;
                            }
                        });
                        let groupClassName = 'persoo-autocompleteDropdown__group ' + group.groupId;
                        return (group.isSingle) ? innerComponents :
                                <div class={groupClassName}>{ innerComponents }</div>;
                    })
                }
            </div>
        );
    }
}

function splitDatasetsToGroups(datasetsOptions) {
    let datasetGroups = {}
    Array.from(datasetsOptions).forEach( (dataset, index) => {
        dataset.index = index;
        if (dataset.group) {
            datasetGroups[dataset.group] = datasetGroups[dataset.group] || [];
            datasetGroups[dataset.group].push(dataset);
        } else {
            datasetGroups['_single_' + index] = [dataset];
        }
    });
    let datasetGroupsList = []
    Object.keys(datasetGroups).forEach( (key) => {
        datasetGroupsList.push({
            groupId: key,
            isSingle: !!(key.match(/^_single_/)),
            datasets: datasetGroups[key]
        });
    });
    return datasetGroupsList;
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
