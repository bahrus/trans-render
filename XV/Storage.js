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
        // window.addEventListener('message', (e: Event) => {
        //     throw 'NI';
        // });
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
export async function set(key, protocol, val, ctx) {
    const aWin = window;
    if (isLoaded) {
        aWin[cache[protocol]][key] = val;
    }
    if (val === null) {
        window[protocol].removeItem(key);
    }
    else {
        if (typeof val === 'object') {
            window[protocol].setItem(key, JSON.stringify(val));
        }
        else {
            window[protocol].setItem(key, val);
        }
    }
    const msg = `${protocol}://${key}`;
    if (ctx !== undefined) {
        ctx.USLs.add(msg);
    }
    else {
        window.postMessage(new Set([msg]));
    }
}
