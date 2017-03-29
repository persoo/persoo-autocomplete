import { h, Component } from 'preact';
import PropTypes from 'proptypes';
import classNames from 'classNames';
import {getCachedHighlightingFunc} from 'utils';
import Cache from 'cache';

const cx = classNames();

class AutocompleteDataset extends Component {
    constructor(props) {
        super(props);
        this.actionCache = new Cache();
    }

    getBoundAction(actionFunction, actionName, datasetIndex, index) {
        const key = JSON.stringify({a: actionName, d: datasetIndex, i: index});
        let f = this.actionCache.get(key);
        if (!f) {
            f = actionFunction.bind(null, datasetIndex, index)
            this.actionCache.set(key, f);
        }
        return f;
    }

    render() {
        const {query, hits, hitsCount, selectedHit, datasetIndex, datasetID, templates,
                classNames, cssProps, priceSuffix, selectHitAction, clickHitAction} = this.props;
        const defaultTemplates = AutocompleteDataset.defaultProps.templates;
        const ItemComponent = templates.hit || defaultTemplates.hit;
        const HeaderComponent = templates.header || defaultTemplates.header;
        const FooterComponent = templates.footer || defaultTemplates.footer;
        const EmptyComponent = templates.empty;
        const highlightQuery = getCachedHighlightingFunc(query, 'b');

        return (
            <div
                {...cx('persoo-autocompleteDataset__root',
                    'persoo-autocompleteDataset-' + datasetID + '__root',
                    classNames.root,
                    {'persoo-selected': selectedHit >= 0})
                }
                style={cssProps.root}
            >
                {
                    HeaderComponent && <HeaderComponent
                        {...cx('persoo-autocompleteDataset__header',
                            classNames.header,
                            'persoo-autocompleteDataset-' + datasetID + '__header')
                        }
                        query={query}
                        count={hitsCount}
                        isEmpty={!hits || hits.length <= 0}
                        style={cssProps.header}
                    />
                }
                {
                    (!hits || hits.length <= 0) && EmptyComponent &&
                    <EmptyComponent
                        {...cx('persoo-autocompleteDataset__empty',
                            classNames.empty,
                            'persoo-autocompleteDataset-' + datasetID + '__empty')
                        }
                        query={query}
                        count={hitsCount}
                        isEmpty={!hits || hits.length <= 0}
                        style={cssProps.empty}
                    />
                }
                <div {...cx('persoo-autocompleteDataset__hits',
                        classNames.hits,
                        'persoo-autocompleteDataset-' + datasetID + '__hits')
                    }
                    style={cssProps.hits}
                >
                    {hits.map( (hit, index) =>
                        <ItemComponent
                            {...cx('persoo-autocompleteDataset__hits__hit',
                                   classNames.hit,
                                   'persoo-autocompleteDataset-' + datasetID + '__hits__hit',
                                   {'persoo-selected': selectedHit == index})
                            }
                            key={hit.objectID}
                            hit={hit}
                            query={query}
                            highlightQuery={highlightQuery}
                            priceSuffix={priceSuffix}
                            style={cssProps.hits__hit}
                            onMouseEnter={(selectedHit != index) && this.getBoundAction(
                                    selectHitAction, 'selectHitAction', datasetIndex, index)}
                            onMouseDown={this.getBoundAction(
                                    clickHitAction, 'clickHitAction', datasetIndex, index)}
                        />
                    )}
                </div>
                {FooterComponent && <FooterComponent
                            {...cx('persoo-autocompleteDataset__footer',
                                    classNames.footer,
                                    'persoo-autocompleteDataset-' + datasetID + '__footer')
                            }
                            query={query}
                            count={hitsCount}
                            isEmpty={!hits || hits.length <= 0}
                            style={cssProps.footer}
                        />
                }
            </div>
        );
    }
}

AutocompleteDataset.propTypes = {
    query: PropTypes.string,

    datasetIndex: PropTypes.number,
    datasetID: PropTypes.string,
    hits: PropTypes.array,
    selectedHit: PropTypes.number,

    templates: {
        hit: PropTypes.oneOfType([
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
        ]).isRequired,
        empty: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired
    },
    cssProps: PropTypes.object,

    selectHitAction: PropTypes.func,
    clickHitAction: PropTypes.func
};

AutocompleteDataset.defaultProps = {
    templates: {
        hit: (props) =>  {
            const {hit, highlightQuery, priceSuffix, className, style,
                onMouseEnter, onMouseDown, onMouseLeave} = props;
            return  <div {...{className, style, onMouseEnter, onMouseDown, onMouseLeave}} >
                        <a href={ hit.link }>
                            <div class="persoo-autocompleteDataset__hits__hit__img">
                                <img src={ hit.imageLink } />
                            </div>
                            <div class="persoo-autocompleteDataset__hits__hit__title"
                                dangerouslySetInnerHTML={{ __html: highlightQuery(hit.title) }}
                            />
                            <div class="persoo-autocompleteDataset__hits__hit__price">
                                {
                                    hit.originalPrice &&
                                    <span class="persoo-autocompleteDataset__hits__hit__price__original">
                                        { hit.originalPrice + priceSuffix }
                                    </span>
                                }
                                <span class="persoo-autocompleteDataset__hits__hit__price__current">
                                    { hit.price + priceSuffix }
                                </span>
                            </div>
                        </a>
                    </div>;
        },
        empty: null,
        header: null,
        footer: null
    },
    cssProps: {
    }
};

export default AutocompleteDataset;
