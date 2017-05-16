import {highlightTerms, splitStringByWordBoundaries} from 'highlightUtils';
import diacriticsUtils from 'diacriticsUtils';

/*global sinon,expect*/

describe('Remove Diacritics', () => {
    it('removeDiacritics()', () => {
        diacriticsUtils.init();
        let testCases = [
            {in: 'čoko', out: 'coko'},
            {in: 'příliš žluťoučký kůň', out: 'prilis zlutoucky kun'}
        ];
        testCases.map((testCase) => {
            let result = diacriticsUtils.removeDiacritics(testCase.in);
            testCase.out.should.equal(result);
        })
    });
});

describe('Highlighting', () => {
/*
    it ('splitStringByWordBoundaries()', () => {
        diacriticsUtils.init();
        let resultText = splitStringByWordBoundaries('mám rád čokoládu');
        resultText.length.should.equal(5);
    });
*/
	it('highlightTerms()', () => {
        let testCases = [
            {q: "coko", str: "čokoláda", expected: "<b>čoko</b>láda"},
            {q: "some", str: "in something", expected: "in <b>some</b>thing"},
            {q: "co ", str: "eco", expected: "eco"},
            {q: "eco ", str: "eco", expected: "<b>eco</b>"},
            {q: "eco", str: "get eco&mix", expected: "get <b>eco</b>&mix"},
            {q: "aa dd    ", str: "my maas has aa  in the middle", expected: "my maas has <b>aa</b>  in the middle"},
        ]

        testCases.map((testCase) => {
            let result = highlightTerms(testCase.q, 'b', testCase.str);
            testCase.expected.should.equal(result);
        })
	});
});
