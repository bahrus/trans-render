import {substrBefore} from './substrBefore.js';
export function getDestructArgs(fn: Function){
    return getArgsFromString(fn.toString());
}
export function getArgsFromString(str: String){
    const fnString = str.trim();
    if(fnString.startsWith('({')){
        const iPos = fnString.indexOf('})', 2);
        return fnString.substring(2, iPos).split(',').map(s => substrBefore(s, ':'));
    }else{
        return [];
    }
}
