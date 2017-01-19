import { h, Component } from 'preact';
import PropTypes from 'proptypes';
import AutocompleteDataset from './autocompleteDataset';
import classNames from 'classNames';

const cx = classNames('autocompleteDropdown');

const defaultStyle = {
        position: "absolute",
        "z-index": 9999
};

class AutocompleteDropdown extends Component {

    render() {
        const {offerID, locationID, query,
                selectedDataset, selectedHit, datasetsOptions, datasetsState,
                selectHitAction, clickHitAction,
                isVisible, style} = this.props;
        let {className} = {...cx('root')};
        className += ' persooLocation persoo__' + offerID;

        return (isVisible &&
            <div
                className={className}
                style={Object.assign(defaultStyle, style)}
                data-offerID={offerID}
                data-locationID={locationID}
                onMouseLeave={selectHitAction.bind(null, null, null)}
            >
                {
                    datasetsOptions.map( (dataset, index) => (
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

AutocompleteDropdown.propTypes = {
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
