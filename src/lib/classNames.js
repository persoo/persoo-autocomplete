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
            classes.push(getClassNames.apply(null, arg));
        } else if (argType === 'object') {
            for (var key in arg) {
                if (arg.hasOwnProperty(key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }

    return classes.join(' ');
}

//Note: Use prefixes to make sure, there are no collisions in "classes"
//with hosting web page and its CSS.
export default function classNames() {
  return (...elements) => ({
    className: getClassNames(elements).split(' ').map((x) => (prefix + '-' +  x)).join(' ')
  });
}