import { h, Component } from 'preact';
import PropTypes from 'proptypes';
import classNames from 'classNames';
import {getHighlightingFunc} from 'utils';

const cx = classNames();

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
                {...cx('autocompleteDataset__root',
                    'autocompleteDataset-' + datasetIndex + '__root',
                    {selected: selectedHit >= 0})
                }
                style={cssClasses.root}
            >
                {HeaderComponent && <HeaderComponent
                            {...cx('autocompleteDataset__header',
                                'autocompleteDataset-' + datasetIndex + '__header')
                            }
                            query={query}
                            isEmpty={!hits || hits.length <= 0}
                            style={cssClasses.header}
                        />
                }
                <div {...cx('autocompleteDataset__hits',
                        'autocompleteDataset-' + datasetIndex + '__hits')
                    }
                    style={cssClasses.hits}
                >
                    {hits.map( (hit, index) =>
                            <ItemComponent
                                {...cx('autocompleteDataset__hits__hit',
                                       'autocompleteDataset-' + datasetIndex + '__hits__hit',
                                       {selected: selectedHit == index})
                                }
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
                            {...cx('autocompleteDataset__footer',
                                    'autocompleteDataset-' + datasetIndex + '__footer')
                            }
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
