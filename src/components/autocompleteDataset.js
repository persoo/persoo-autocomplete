import { h, Component } from 'preact';
import PropTypes from 'proptypes';
import classNames from './classNames.js';
import {getHighlightingFunc} from 'utils';

const cx = classNames('autocompleteDataset');

class AutocompleteDataset extends Component {

    render() {
        const {query, hits, selectedHit, datasetIndex, templates, cssClasses,
                selectHitAction, clickHitAction} = this.props;
        const defaultTemplates = AutocompleteDataset.defaultProps.templates;
        const ItemComponent = templates.item || defaultTemplates.item;
        const HeaderComponent = templates.header || defaultTemplates.header;
        const FooterComponent = templates.footer || defaultTemplates.footer;
        const highlightQuery = getHighlightingFunc(query, 'b');

        return (
            <div
                {...cx('root', 'id' + datasetIndex, (selectedHit >= 0 ? 'selected' : false))}
                style={cssClasses.root}
            >
                {HeaderComponent && <HeaderComponent
                            {...cx('header')}
                            query={query}
                            isEmpty={!hits || hits.length <= 0}
                            style={cssClasses.header}
                        />
                }
                <div {...cx('hits')} style={cssClasses.hits}>
                    {hits.map( (hit, index) =>
                            <ItemComponent
                                {...cx('hits__hit', (selectedHit == index ? 'selected' : false))}
                                key={hit.objectID}
                                hit={hit}
                                query={query}
                                highlightQuery={highlightQuery}
                                style={cssClasses.hits__hit}
                                onMouseEnter={(selectedHit != index) && selectHitAction.bind(null, datasetIndex, index)}
                                onMouseDown={clickHitAction.bind(null, datasetIndex, index)}
                            />
                    )}
                </div>
                {FooterComponent && <FooterComponent
                            {...cx('footer')}
                            query={query}
                            isEmpty={!hits || hits.length <= 0}
                            style={cssClasses.footer}
                        />
                }
            </div>
        );
    }
}

AutocompleteDataset.propTypes = {
    query: PropTypes.string,

    datasetIndex: PropTypes.number,
    hits: PropTypes.array,
    selectedHit: PropTypes.number,

    templates: {
        item: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired,
        header: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired,
        footer: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired
    },
    cssClasses: PropTypes.object,

    selectHitAction: PropTypes.func,
    clickHitAction: PropTypes.func
};

AutocompleteDataset.defaultProps = {
    templates: {
        item: hit =>
            <div
              style={{
                borderBottom: '1px solid #bbb',
                paddingBottom: '5px',
                marginBottom: '5px',
              }}
            >{JSON.stringify(hit).slice(0, 100)}...</div>,
        header: null,
        footer: null
    },
    cssClasses: {
    }
};

export default AutocompleteDataset;
