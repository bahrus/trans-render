//import {getProp} from '../lib/getProp.js';
const cache = {
    sessionStorage: Symbol.for('yx84OGtTMU2GufafFtsZLw'),
    localStorage: Symbol.for('eFljX6VSOkOAmcNJyph1sw')
};
const initialized = {
    sessionStorage: Symbol('1IBxCFcbCUW3KQllamedmw'),
    localStorage: Symbol('H2lL+vYErUGixatKub3nWA')
};
const isLoaded = navigator.deviceMemory > 1;
export function init(whichStorage, win = window) {
    const aWin = win;
    const initializedKey = initialized[whichStorage];
    if (aWin[initializedKey])
        return;
    aWin[initializedKey] = true;
    if (!aWin[cache[whichStorage]] && isLoaded) {
        aWin[cache[whichStorage]] = {};
    }
}
init('localStorage');
init('sessionStorage');
export async function get(key, protocol) {
    const aWin = window;
    if (isLoaded) {
        const cachedVal = aWin[cache[protocol]][key];
        if (cachedVal !== undefined)
            return cachedVal;
    }
    let returnObj = window[protocol].getItem(key);
    if (returnObj === null)
        return null;
    try {
        returnObj = JSON.parse(returnObj);
    }
    catch (e) { }
    if (isLoaded) {
        aWin[cache[protocol]][key] = returnObj;
    }
    return returnObj;
}
export async function set(key, splitPath, protocol) {
    const head = splitPath.shift();
    if (head === undefined)
        throw 400;
}
