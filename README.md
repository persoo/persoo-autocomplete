# Persoo autocomplete

Full featured autocomplete widget based on React.

Try online [Demo] and play with it.


---


# Quick-Start Guide

- [How to use it](#how-to-use-it)
   - [Loading persooAutocomplete.js](#1-load-persooautocompletejs-to-your-page)
   - [Binding autocomplete to INPUT element](#2-create-a-persooautocomplete-instance)
   - [Configuration Options](#available-options)
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
            source: window.persoo.getSuggestSource(algorithmID, 5),
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

### Available options

* **autocompleteID** (string) -- unique ID to be used as HTML container id.
* **offerID** (string) -- persoo offerID for measuring statistics
* **locationID** (string) -- persoo locationID for measuring statistics

* **minChars** (number) -- for how many characters in the input it starts suggesting
* **showEmptyResults** (boolean, true) -- show dropdown event if there are no results in any dataset
* **openOnFocus** (boolean, true) -- open dropdown again on focus (even without changing query)
* **closeOnBlur** (boolean, true) -- false is very usefull for debugging

* **offsetLeft** (number, 0) -- dropdown offset in px relatively to InputElement
* **offsetTop** (number, 1) -- dropdown offset in px relatively to InputElement
* **width** (number|null, null) -- dropdown width in px, null means use the width of the Input Element

* **datasets** (array of objects) -- datasetOptions for each dataset
  * **source** (function) -- `function (query, callback)` which for given query calls `callback(result)`, where result is array of hits. Most often you will use `window.persoo.getSuggestSource(algorithmID, 5)` to get 5 results for persoo algorithm with id algorithmID.
  * **templates** (map) -- templates for each item in the structure.

    * header
    * hit
    * footer
  * **cssClasses** (map) -- for each element, it contains map with CSS properties,
    * header (map with CSS props)
    * hit (map with CSS props)
    * footer (map with CSS props)
* **cssClasses** (map) ---- for each element, it contains map with CSS properties,
    * root (map with CSS props)

* **onSelect** (function) -- function(selectedHit){} to be called when user selects suggested hit


> NOTES:
> **Templates:** template is string or `function(data) {return "<div>html</div>";}`, which receives
```json
{
   query: "<current query>",
   hit: {"<currentHit>": "<as received from server>", ...},
   highlightQuery: function(str) {return "<highlighted query in str>"}
}
```

> **cssClasses:** cssClasses for each element contains map with CSS properties.
> For example for `<root>` element it is `{root: { color: "green", padding: 5}}`

> :information_source: TODO:
> * width: none, auto ... given by CSS
> * custom listeners to events


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

> You can also use inline CSS styles provided through options (cssClasses on various objects).

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

