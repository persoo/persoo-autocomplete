import cx from 'classnames';
const prefix = 'persoo';

// Note: Use prefixes to make sure, there are no "classes" colictions
// with host webpage CSS.

export default function classNames(block) {
  return (...elements) => ({
    className: cx(
      elements
        .filter(element => element !== undefined && element !== false)
        .map(element => `${prefix}-${block}__${element}`)
      ),
  });
}