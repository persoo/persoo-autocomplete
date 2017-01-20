import { h, render } from 'preact';


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
window.persoo.getSuggestSource = function(algorithmID, maxCount) {
    return function(term, callback){
        console.log('SuggestSource: sending request for query "' + term + "'.");
        persoo('send', 'suggest',
                {_w:'getAlgorithm', algorithmID: algorithmID, query: term, count: maxCount},
                function(data){ callback(data.items.slice(0, maxCount) || []); }
        );
    }
}

if (module.hot) {
    module.hot.accept('./components/autocompleteManager', () => requestAnimationFrame(init) );
}
