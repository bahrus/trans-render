import { Specifier } from "../ts-refs/trans-render/dss/types";

export function getConstVal(specifier: Specifier){
    const { constVal, as } = specifier;
    switch(as){
        case 'number':
        case 'boolean':
        case 'boolean|number':
            return JSON.parse(constVal);
        case 'string':
            return constVal;
        default:
            throw 'NI';
    }
}