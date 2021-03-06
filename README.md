# Persoo autocomplete

Full featured autocomplete widget written in React.
  * lightning fast reaction, rendering only html differences
  * request caching (saving your server resouces)
  * fully customizable to your requests format, CSS, ...

Try online [Demo] and play with it.


---


# Quick-Start Guide

- [How to use it](#how-to-use-it)
   - [Loading persooAutocomplete.js](#1-load-persooautocompletejs-to-your-page)
   - [Binding autocomplete to INPUT element](#2-create-a-persooautocomplete-instance)
   - [Configuration Options](#available-options)
   - [Using Your Templates](#templates)
   - [Styling with CSS](##3-use-your-own-css-styles)
- [Development Workflow](#development-workflow)

## How to use it

See [Demo] source code for more details and examples.

### 1. Load [persooAutocomplete.js] to your page

and prepare Input element on which you want to bind "autocomplete".

```html
<script src="./dist/persooAutocomplete.js"></script>
<input id="demoInput">
<div id="demoDropdownContainer">
```

### 2. Create a PersooAutocomplete instance

and bind it to your input element

```javascript
var myAutocomplete1 = new PersooAutocomplete('#demoInput1', '#demoDropdownContainer', {
    // ... options ...
    datasets: [
        {
            source: window.persoo.getAlgorithmSource(algorithmID, 5),
            group: "myGroupID", // optional
            templates: {
                //  optional templates for header, item, footer
            }
        }
    ]
});
```

Let us look at the structure of the dropdown box, which will be displayed below your input with suggested results.
Knowing the structure will help you to understand the options, because they are related to parts of this structure.

```xml
<autocompleteDropdown>
    <div class="myGroupID">
        <autocompleteDataset>
            <header>
            <items>
                <item>
                ... other items ...
            </items>
            <footer>
        </autocompleteDataset>
        ... other datasets ...
</autocompleteDropdown>
```

Items may be replaced by `<Empty>` when there are no items in dataset. `<Empty>` typically displays "No results found.".

> NOTE: datasets are grouped by the same group id or have no group wrapper iff their configuration contains no "group" field.
>

> NOTE: if you need to access datasets data from outside, see `myAutocomplete1.autocompleteManager.state.datasets` object.
>

### Available options

For each option, there is data type and default value in the bracket.

* **autocompleteID** (string) -- unique ID to be used as HTML container id.
* **offerID** (string) -- persoo offerID for measuring statistics
* **locationID** (string) -- persoo locationID for measuring statistics

* **minChars** (number) -- for how many characters in the input it starts suggesting
* **requestThrottlingInMs** (number as millis) -- how offten we can ask for new suggestions. There can be at most 1 request in throttling interval.
* **openOnFocus** (boolean, true) -- open dropdown again on focus (even without changing query)
* **closeOnBlur** (boolean, true) -- false is very usefull for debugging

* **offsetLeft** (number|null, 0) -- dropdown offset in px relatively to InputElement, null means do not set width in inline styles
* **offsetTop** (number|null, 1) -- dropdown offset in px relatively to InputElement, null means do not set width in inline styles
* **width** (number|'input'|null, 'input') -- dropdown width in px, 'input' means use the width of the Input Element, null means do not set width in inline styles because it will be set in CSS.

* **placeholdersToRotate** (array of strings|null, 0) -- simulate typing effect in InputElement, rotate given placeholders
* **placeholdersRotationPeriod** (number|null, 4000) -- typing effect period in ms, how long is one placeholder text displayed after finishing typing

* **showWhenAllResultsEmpty** (boolean, false) -- show no results template in case, all datasets contains no results
* **noResultTemplate** (string or function, null) -- template to be shown when all results in all datasets are empty

* **datasets** (array of objects) -- datasetOptions for each dataset
  * **id** (string) -- id used in CSS classes for this dataset (dataset index is used by default)
  * **source** (function) -- `function (query, callback)` which for given query calls `callback(result)`, where result is `{items: [], itemsCount: 0}`. `Items` are items to be displayed and `itemsCount` are total items found (not only items returned). Most often you will use `window.persoo.getAlgorithmSource(algorithmID, 5)` to get 5 results for persoo algorithm with id algorithmID.
  * **showWhenEmptyResults** (boolean, true) -- show dataset even with empty results (other dataset may have some results)
  * **templates** (map) -- templates for each item in the structure.

    * header
    * item
    * footer
    * empty -- there is no default template, will not display if not provided in options
  * **classNames** (map) -- for each dataset element, it contains custom class names,
    * root (string)
    * items (string)
    * item (string)
    * header (string)
    * footer (string)
    * empty (string)
  * **cssProps** (map) -- for each element, it contains map with CSS properties,
    * header (map with CSS props)
    * item (map with CSS props)
    * footer (map with CSS props)
    * empty (map with CSS props)
* **classNames** (map) -- for each dataset element, it contains custom class names,
    * root (string)
* **cssProps** (map) ---- for each element, it contains map with CSS properties,
    * root (map with CSS props)

* **analytics** (map) -- push virtual pageview to external analytics, when query is nonempty and dropdown is displayed (even with no results)
    * pushFunction (function) -- your code for reporting virtual pageview to your analytics    
    * triggerDelayInMs (number, 3000) -- wait until user stops typing. User must be inactive for at least `triggerDelayInMs` milliseconds.
    * triggerOnClick (boolean, true) -- send virtual pageview immediately when anything clicked in page
* **onSelect** (function) -- `function(selectedItem, redirectToItemLink){}` to be called when user selects suggested item (either by click or pressing Enter). Default `onSelect()` calls only `redirectToItemLink()`, but you can override default onSelect function and add your own actions.
* **onRender** (function) -- `function(simpleState){}` to be called dropdown rendering with argumetn {isVisible: true/false, datasets: datasetsList}, so you can use isVisible status, i.e. to update input box classes. By default there is no function.
* **onQueryChanged** (function) -- `function(simpleState){}` to be called dropdown rendering with argumetn {query: "current query"}. By default there is no function.


> NOTE 1:
>
>  Default on select action redirects to `item.link`, not to src in rendered `<a>` element. This way we redirect to the same link by both click and pressing Enter. But `<a>` elements are usefull, i.e. let's use right mouse button to open link in new tab.


> NOTE 2:
>

> **cssProps:** cssProps for each element contains map with CSS properties.
> For example for `<root>` element it is
```javascript
{
   root: {
       color: "green",
       padding: 5
   }
}
```

> :information_source: TODO:
> * custom listeners to events

> NOTE 3:
>
>  Query is sanitized. All HTML tags are removed to prevent XSS vulnerability.

### Templates

Template may have one of the following formats
  * plain string
  * string which represents EmbeddedJS template, i.e. `"<% if (isEmpty) { %><div>my content with <%= query %></div><% }%>"` where `<%` switch you to javascript and `<%=` insert javascript expression to output.
  * `function(data) {if (data.isEmpty) { return "<div>my content with " + data.query + "</div>";}}`, which receives
```javascript
data = {
   isEmpty: false, /* is current dataset empty */
   query: "<current query>",
   item: { /* current item as received from Souce (server) */ },
   highlightQuery: function(str) { return "<highlighted query in str>" }
      // useful for highlighting custom fields in items
      // - ignores cases and accents/diacritics, i.e. cr, čr, Čr, CR, ... are highlighted for query "cr"
      // - hightlights only prefixes, not text in the middle of word
}
```
and return string with rendered HTML.


### 3. Use your own CSS styles

Persoo autocomplte uses [BEM] coding style, so adding CSS rules should be simple and easy.
Dropdown box displayed below your input has folowing structure and classes.

```html
<div id="yourAutocompleteID" class="persoo-persooAutocomplete persoo-autocompleteDropdown__root">
   <div class="persoo-autocompleteDataset__root persoo-autocompleteDataset-0__root">
      <div class="persoo-autocompleteDataset__header persoo-autocompleteDataset-0__header">
         ... header from template ...
      </div>
      <div class="persoo-autocompleteDataset__items persoo-autocompleteDataset-0__items">
         ... other items ...
         <div class="persoo-autocompleteDataset__items__item persoo-autocompleteDataset-0__items__item">
               ... item from your template ...
         </div>
         <div class="persoo-autocompleteDataset__items__item persoo-autocompleteDataset-0__items__item selected">
               ... selected item from your template ...
         </div>
         ... other items ...
      <div class="persoo-autocompleteDataset__footer persoo-autocompleteDataset-0__footer">
         ... header from template ...
      </div>
   </div>
   <div class="persoo-autocompleteDataset__root persoo-autocompleteDataset-1__root">
      ... similarly other datasets ...
   </div>
</div>
```

You can find a few CSS examples in the [Demo]. Just look at the source code for corresponding `<style>` element.

> You can also use inline CSS styles provided through options (cssProps on various objects).

### 4. Custom onSumit handlers / custom onSubmit logic

Sometimes you need to wait for data received for the query and call your custom javascript function to decide
what to do on form submit -- either go to search results page or go directly to item detail in case when itemID
has exact match with query. You can use autocomplete actions as following:

```html
<script>
var myAutocompleteOnSubmit = function(e) {
    var query = myAutocomplete.autocompleteManager.state.query;
    myAutocomplete1.autocompleteManager.actions.waitForDataReceived(3000, function callback(){        
        var datasets = myAutocomplete.autocompleteManager.state.datasets;
        // custom logic with
        alert('you searched for "' + query + '"');
    })
    return false; // to prevent default onSubmit handler
}
</script>
<form id="mySearchForm" accept-charset="utf-8" role="search" onsubmit="javascript: return myAutocompleteOnSubmit();">
    <div>
        <input id="myInput" type="search" autocomplete="off">
        <input id="mySubmit" type="submit" value="Search">
    </div>
</form>
```

## Development Workflow

Or checkout this repository and modify it as you want to.

**4. Start a live-reload development server:**

```sh
npm run dev
```

> This is a full web server nicely suited to your project. Any time you make changes within the `src` directory, it will rebuild and even refresh your browser.

**5. Testing with `mocha`, `karma`, `chai`, `sinon` via `phantomjs`:**

```sh
npm test
```

**6. Generate a production build in `./build`:**

```sh
npm run build
```

The output is in the /build directory.

**5. Start local production server with `superstatic`:**

```sh
npm start
```

> This is to simulate a production (CDN) server with gzip. It just serves up the contents of `./build`.



## License

MIT

[Demo]: <http://htmlpreview.github.io/?https://github.com/persoo/persoo-autocomplete/blob/master/demo/index.html>
[persooAutocomplete.js]: <./dist/persooAutocomplete.js>
[BEM naming standarts]: <http://getbem.com/naming/>
