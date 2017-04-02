import {highlightTerms} from 'highlightUtils';

/*global sinon,expect*/

describe('Highlighting', () => {
	it('highlightTerms()', () => {
        let testCases = [
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
