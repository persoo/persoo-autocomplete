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
        const {offerID, locationID, autocompleteID, query,
                selectedDataset, selectedHit, datasetsOptions, datasetsState,
                selectHitAction, clickHitAction,
                isVisible, style} = this.props;
        let {className} = {...cx('autocompleteDropdown__root', offerID)};
        className += ' persooLocation';

        return (isVisible &&
            <div
                id={autocompleteID}
                className={className}
                style={Object.assign({}, defaultStyle, style)}
                data-offerID={offerID}
                data-locationID={locationID}
                onMouseLeave={selectHitAction.bind(null, null, null)}
            >
                {
                    datasetsOptions.map( (dataset, index) => (
                        canShowDataset(datasetsOptions, datasetsState, index) &&
                        <AutocompleteDataset
                            hits={datasetsState[index].hits}
                            selectedHit={selectedDataset == index ? selectedHit : -1}
                            datasetIndex={index}
                            templates={datasetsOptions[index].templates}
                            cssClasses={datasetsOptions[index].cssClasses}
                            {...{query, selectHitAction, clickHitAction}}
                        />
                    ))
                }
            </div>
        );
    }
}

function canShowDataset(datasetsOptions, datasetsState, index) {
    const hits = datasetsState[index].hits;
    return (datasetsOptions[index].showWhenEmptyResults || (hits && hits.length > 0));
}

AutocompleteDropdown.propTypes = {
    autocompleteID: PropTypes.string,
    offerID: PropTypes.string,
    locationID: PropTypes.string,
    isVisible: PropTypes.boolean,
    datasetsOptions: PropTypes.array,
    datasetsState: PropTypes.array,
    selectedDataset: PropTypes.number,
    selectedHit: PropTypes.number,
    selectHitAction: PropTypes.func,
    clickHitAction: PropTypes.func,
    style: PropTypes.object
};

export default AutocompleteDropdown;
