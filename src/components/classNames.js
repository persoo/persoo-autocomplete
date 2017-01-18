const prefix = 'persoo';

/* Inspired by https://github.com/JedWatson/classnames
 * Usage:
    getClassNames('foo', 'bar'); // => 'foo bar'
    getClassNames('foo', { bar: true }); // => 'foo bar'
    getClassNames({ 'foo-bar': true }); // => 'foo-bar'
    getClassNames({ 'foo-bar': false }); // => ''
    getClassNames({ foo: true }, { bar: true }); // => 'foo bar'
    getClassNames({ foo: true, bar: true }); // => 'foo bar'
    getClassNames(['a', 'b', 'c']); // => 'a b c'
 */
function getClassNames () {
    var classes = [];

    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!arg) continue;

        var argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            classes.push(classNames.apply(null, arg));
        } else if (argType === 'object') {
            for (var key in arg) {
                if (hasOwn.call(arg, key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }

    return classes.join(' ');
}

//Note: Use prefixes to make sure, there are no collisions in "classes"
//with hosting web page and its CSS.
export default function classNames(block) {
  return (...elements) => ({
    className: getClassNames(
      elements
        .filter(element => element !== undefined && element !== false)
        .map(element => `${prefix}-${block}__${element}`)
      ),
  });
}