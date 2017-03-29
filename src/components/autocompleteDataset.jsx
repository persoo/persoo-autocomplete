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
        const {query, items, itemsCount, selectedItem, datasetIndex, datasetID, templates,
                classNames, cssProps, priceSuffix, selectItemAction, clickItemAction} = this.props;
        const defaultTemplates = AutocompleteDataset.defaultProps.templates;
        const ItemComponent = templates.item || defaultTemplates.item;
        const HeaderComponent = templates.header || defaultTemplates.header;
        const FooterComponent = templates.footer || defaultTemplates.footer;
        const EmptyComponent = templates.empty;
        const highlightQuery = getCachedHighlightingFunc(query, 'b');

        return (
            <div
                {...cx('persoo-autocompleteDataset__root',
                    'persoo-autocompleteDataset-' + datasetID + '__root',
                    classNames.root,
                    {'persoo-selected': selectedItem >= 0})
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
                        count={itemsCount}
                        isEmpty={!items || items.length <= 0}
                        style={cssProps.header}
                    />
                }
                {
                    (!items || items.length <= 0) && EmptyComponent &&
                    <EmptyComponent
                        {...cx('persoo-autocompleteDataset__empty',
                            classNames.empty,
                            'persoo-autocompleteDataset-' + datasetID + '__empty')
                        }
                        query={query}
                        count={itemsCount}
                        isEmpty={!items || items.length <= 0}
                        style={cssProps.empty}
                    />
                }
                <div {...cx('persoo-autocompleteDataset__items',
                        classNames.items,
                        'persoo-autocompleteDataset-' + datasetID + '__items')
                    }
                    style={cssProps.items}
                >
                    {items.map( (item, index) =>
                        <ItemComponent
                            {...cx('persoo-autocompleteDataset__items__item',
                                   classNames.item,
                                   'persoo-autocompleteDataset-' + datasetID + '__items__item',
                                   {'persoo-selected': selectedItem == index})
                            }
                            key={item.objectID}
                            item={item}
                            query={query}
                            highlightQuery={highlightQuery}
                            priceSuffix={priceSuffix}
                            style={cssProps.items__item}
                            onMouseEnter={(selectedItem != index) && this.getBoundAction(
                                    selectItemAction, 'selectItemAction', datasetIndex, index)}
                            onMouseDown={this.getBoundAction(
                                    clickItemAction, 'clickItemAction', datasetIndex, index)}
                        />
                    )}
                </div>
                {FooterComponent && <FooterComponent
                            {...cx('persoo-autocompleteDataset__footer',
                                    classNames.footer,
                                    'persoo-autocompleteDataset-' + datasetID + '__footer')
                            }
                            query={query}
                            count={itemsCount}
                            isEmpty={!items || items.length <= 0}
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
    items: PropTypes.array,
    selectedItem: PropTypes.number,

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
        ]).isRequired,
        empty: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]).isRequired
    },
    cssProps: PropTypes.object,

    selectItemAction: PropTypes.func,
    clickItemAction: PropTypes.func
};

AutocompleteDataset.defaultProps = {
    templates: {
        item: (props) =>  {
            const {item, highlightQuery, priceSuffix, className, style,
                onMouseEnter, onMouseDown, onMouseLeave} = props;
            return  <div {...{className, style, onMouseEnter, onMouseDown, onMouseLeave}} >
                        <a href={ item.link }>
                            <div class="persoo-autocompleteDataset__items__item__img">
                                <img src={ item.imageLink } />
                            </div>
                            <div class="persoo-autocompleteDataset__items__item__title"
                                dangerouslySetInnerHTML={{ __html: highlightQuery(item.title) }}
                            />
                            <div class="persoo-autocompleteDataset__items__item__price">
                                {
                                    item.originalPrice &&
                                    <span class="persoo-autocompleteDataset__items__item__price__original">
                                        { item.originalPrice + priceSuffix }
                                    </span>
                                }
                                <span class="persoo-autocompleteDataset__items__item__price__current">
                                    { item.price + priceSuffix }
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
