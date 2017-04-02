import diacriticsUtils from './diacriticsUtils';

/** Highlight words from qeury in string str,
 *  by using <tagName>...</tagName> for highlighting
 */
// TODO creat custom "word.match(term)" function which considers also edit distance
function highlightTerms(query, tagName, str) {
    const terms = query.toLowerCase().split(/\s+/);

    function highlightWord(word) {
        const wordLowerCase = word.toLowerCase();
        const wordWithoutAccents = diacriticsUtils.removeDiacritics(word).toLowerCase();
        for (let i = 0; i < terms.length; i++) {
            const term = terms[i];
            if (term.length > 0) {
                if (i == terms.length - 1) {
                    // prefix term match
                    if (wordLowerCase.indexOf(term) == 0 || wordWithoutAccents.indexOf(term) == 0) {
                        const wordPrefix = word.substr(0, term.length);
                        const wordRest = word.substr(term.length);
                        word = "<" + tagName + ">" + wordPrefix + "</" + tagName + ">" + wordRest;
                    }
                } else {
                    // full word match
                    if (wordLowerCase == term || wordWithoutAccents == term) {
                        word = "<" + tagName + ">" + word + "</" + tagName + ">";
                        break;
                    }
                }
            }
        }

        return word;
    }

    const words = str.split(/\b/);
    return words.map(highlightWord).join('');
}


/**
 * Return compiled function for highlighting words from "terms" by wrapping matched terms in tagName.
 * I.e. highlight('hello', 'em') will produce '<em>hello</em> world' from 'hello world'.
 * @param {string} terms / query
 * @param {string} tagName
 */
function getHighlightingFunc(terms, tagName) {
    if (!terms) {
        return function (str) {return str;}
    } else {
        diacriticsUtils.init();
        return highlightTerms.bind(this, terms, tagName);
    }
}

export {
    getHighlightingFunc,
    highlightTerms
}
