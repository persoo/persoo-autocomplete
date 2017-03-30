import { h, render } from 'preact';
import objectAssignPolyfill from 'objectAssignPolyfill';

// add all necessary polyfills
objectAssignPolyfill();

/**
 * Add autocomplete functionality to an input.
 * It's just a wrapper function to call React component and add it to document body.
 *
 * TODO spec, how to use
 */
class PersooAutocomplete {
      constructor(inputSelector, options) {
        this._inputSelector = inputSelector;
        this._options = options;
        this._render();
        this.root = null;
        return this;
      }

      _render() {
          let AutocompleteManager = require('./components/autocompleteManager').default;
          this.root = render(
              <AutocompleteManager inputSelector={this._inputSelector} options={this._options} />,
              document.body, this.root
          );
      }

      setOptions(options) {
          this._options = options;
          this._render();
      }

      destroy() {
        ReactDOM.unmountComponentAtNode(this.root);
      }
}

window.PersooAutocomplete = PersooAutocomplete;


// add suggest source to Persoo client
// TODO later add the method directly to Persoo client
window.persoo = window.persoo || {};
window.persoo.getAlgorithmSource = function(algorithmID, maxCount) {
    return function(term, callback){
        if (DEBUG) console.log('AlgorithmSource: sending request for query "' + term + "'.");

        persoo('send', 'suggest',
                {_w:'getRecommendation', algorithmID: algorithmID, query: term, page: 0, itemsPerPage: maxCount},
                function(data){
                    callback({
                        items: data.items || [],
                        itemsCount: data.itemsCount || 0
                    });
                }
        );
    }
}

if (module.hot) {
    module.hot.accept('./components/autocompleteManager', () => requestAnimationFrame(init) );
}
