import { tryParse } from './tryParse.js';
import { lispToCamel } from '../lispToCamel.js';
export const strType = String.raw `\||\#|\@|\/|\%|\~|\-`;
const perimeter = String.raw `\^(?<perimeter>.*)`;
const prop = String.raw `(?<prop>[\w\-\:\|]+)`;
const typeProp = String.raw `(?<elType>${strType})${prop}`;
const perimeterTypeProp = String.raw `${perimeter}${typeProp}`;
const reDependencyStatements = [
    {
        regExp: new RegExp(String.raw `^${perimeterTypeProp}`),
        defaultVals: {}
    },
    {
        regExp: new RegExp(String.raw `^${typeProp}`),
        defaultVals: {}
    },
    {
        regExp: new RegExp(String.raw `^${prop}`),
        defaultVals: { elType: '/' }
    }
];
export function prsElO(str, splitProp = true) {
    const returnObj = {};
    const eventSplit = str.split('::');
    let nonEventPart = eventSplit[0];
    if (eventSplit.length > 1) {
        returnObj.event = eventSplit[1];
    }
    const test = tryParse(nonEventPart, reDependencyStatements);
    if (test === null)
        throw 'PE'; //Parsing error
    if (test.elType === '-') {
        test.marker = `-${test.prop}`;
        test.prop = lispToCamel(test.prop);
    }
    for (const field of ['prop', 'event']) {
        test[field] = test[field]?.replaceAll('\\', '');
    }
    if (splitProp) {
        const { prop } = test;
        if (prop?.includes(':')) {
            const split = prop.split(':');
            test.prop = split[0];
            const rest = split.slice(1).join('.');
            const headChar = (split.length > 2 || rest.includes('|')) ? '.' : '';
            test.subProp = `${headChar}${rest}`;
        }
    }
    return test;
}
export function getSubProp(elo, el) {
    const { subProp } = elo;
    return subProp || el.getAttribute('itemprop') || el.name || el.id;
}
