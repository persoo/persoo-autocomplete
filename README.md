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
<input id="#demoInput">
```

### 2. Create a PersooAutocomplete instance

and bind it to your input element

```javascript
var myAutocomplete1 = new PersooAutocomplete('#demoInput1', {
    // ... options ...
    datasets: [
        {
            source: window.persoo.getAlgorithmSource(algorithmID, 5),
            templates: {
                //  optional templates for header, hit, footer
            }
        }
    ]
});
```

Let us look at the structure of the dropdown box, which will be displayed below your input with suggested results.
Knowing the structure will help you to understand the options, because they are related to parts of this structure.

```xml
<autocompleteDropdown>
    <autocompleteDataset>
        <header>
        <hits>
            <hit>
            ... other hits ...
        </hits>
        <footer>
    </autocompleteDataset>
    ... other datasets ...
</autocompleteDropdown>
```

Hits may be replaced by `<Empty>` when there are no hits in dataset. `<Empty>` typically displays "No results found.".

### Available options

For each option, there is data type and default value in the bracket.

* **autocompleteID** (string) -- unique ID to be used as HTML container id.
* **offerID** (string) -- persoo offerID for measuring statistics
* **locationID** (string) -- persoo locationID for measuring statistics

* **minChars** (number) -- for how many characters in the input it starts suggesting
* **requestThrottlingInMs** (number as millis) -- how offten we can ask for new suggestions. There can be at most 1 request in throttling interval.
* **openOnFocus** (boolean, true) -- open dropdown again on focus (even without changing query)
* **closeOnBlur** (boolean, true) -- false is very usefull for debugging

* **offsetLeft** (number, 0) -- dropdown offset in px relatively to InputElement
* **offsetTop** (number, 1) -- dropdown offset in px relatively to InputElement
* **width** (number|'input'|null, 'input') -- dropdown width in px, 'input' means use the width of the Input Element, null means do not set width in inline styles because it will be set in CSS.

* **datasets** (array of objects) -- datasetOptions for each dataset
  * **id** (string) -- id used in CSS classes for this dataset (dataset index is used by default)
  * **source** (function) -- `function (query, callback)` which for given query calls `callback(result)`, where result is `{hits: [], hitsCount: 0}`. `Hits` are hits to be displayed and `hitsCount` are total hits found (not only hits returned). Most often you will use `window.persoo.getAlgorithmSource(algorithmID, 5)` to get 5 results for persoo algorithm with id algorithmID.
  * **showWhenEmptyResults** (boolean, true) -- show dataset even with empty results (other dataset may have some results)
  * **templates** (map) -- templates for each item in the structure.

    * header
    * hit
    * footer
    * empty -- there is no default template, will not display if not provided in options
  * **cssProps** (map) -- for each element, it contains map with CSS properties,
    * header (map with CSS props)
    * hit (map with CSS props)
    * footer (map with CSS props)
    * empty (map with CSS props)
* **cssProps** (map) ---- for each element, it contains map with CSS properties,
    * root (map with CSS props)

* **onSelect** (function) -- `function(selectedHit, redirectToHitLink){}` to be called when user selects suggested hit (either by click or pressing Enter). Default `onSelect()` calls only `redirectToHitLink()`, but you can override default onSelect function and add your own actions.

> NOTE 1:
>
>  Default on select action redirects to `hit.link`, not to src in rendered `<a>` element. This way we redirect to the same link by both click and pressing Enter. But `<a>` elements are usefull, i.e. let's use right mouse button to open link in new tab.


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


### Templates

Template may have one of the following formats
  * plain string
  * string which represents EmbeddedJS template, i.e. `"<% if (isEmpty) { %><div>my content with <%= query %></div><% }%>"` where `<%` switch you to javascript and `<%=` insert javascript expression to output.
  * `function(data) {if (data.isEmpty) { return "<div>my content with " + data.query + "</div>";}}`, which receives
```javascript
data = {
   isEmpty: false, /* is current dataset empty */
   query: "<current query>",
   hit: { /* current hit as received from Souce (server) */ },
   highlightQuery: function(str) {return "<highlighted query in str>"}
      // useful for highlighting custom fields in hits
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
      <div class="persoo-autocompleteDataset__hits persoo-autocompleteDataset-0__hits">
         ... other hits ...
         <div class="persoo-autocompleteDataset__hits__hit persoo-autocompleteDataset-0__hits__hit">
               ... hit from your template ...
         </div>
         <div class="persoo-autocompleteDataset__hits__hit persoo-autocompleteDataset-0__hits__hit selected">
               ... selected hit from your template ...
         </div>
         ... other hits ...
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
