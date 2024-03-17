import { tryParse } from './tryParse.js';
export const strType = String.raw `\||\#|\@|\/|\%|\~`;
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
export function prsElO(str) {
    const returnObj = {};
    const eventSplit = str.split('::');
    let nonEventPart = eventSplit[0];
    if (eventSplit.length > 1) {
        returnObj.event = eventSplit[1];
    }
    const test = tryParse(nonEventPart, reDependencyStatements);
    if (test === null)
        throw 'PE'; //Parsing error
    for (const field of ['prop', 'event']) {
        test[field] = test[field]?.replaceAll('\\', '');
    }
    return test;
}
