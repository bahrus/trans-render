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
    if (isLoaded) {
        const originalGetItem = win[whichStorage].getItem;
        const boundGetItem = originalGetItem.bind(win[whichStorage]);
        win[whichStorage].getItem = function (key) {
            const item = boundGetItem(key);
            if (item === null)
                return null;
            if (isLoaded) {
                const fromCache = aWin[cache[whichStorage]][key];
                if (fromCache)
                    return fromCache;
            }
            ;
            try {
                const val = JSON.parse(item);
                if (isLoaded) {
                    aWin[cache[whichStorage]][key] = val;
                }
                return val;
            }
            catch (e) {
                return item;
            }
        };
    }
    const originalSetItem = win[whichStorage].setItem;
    const boundSetItem = originalSetItem.bind(win[whichStorage]);
    win[whichStorage].setItem = function (key, val) {
        const oldVal = sessionStorage.getItem(key);
        if (!isLoaded) {
            boundSetItem(key, val);
        }
        else {
            switch (typeof val) {
                case 'string':
                    boundSetItem(key, val);
                    break;
                case 'object':
                    const newVal = JSON.stringify(val);
                    if (newVal === oldVal)
                        return;
                    aWin[whichStorage][key] = val;
                    boundSetItem(key, newVal);
                    break;
                default:
                    throw "Not Implemented";
            }
        }
        window.postMessage(`${whichStorage}://key`);
    };
    const originalRemoveItem = win.sessionStorage.removeItem;
    const boundRemoveItem = originalRemoveItem.bind(win.sessionStorage);
    win.sessionStorage.removeItem = function (key) {
        const oldVal = sessionStorage.getItem(key);
        boundRemoveItem(key);
        if (isLoaded)
            delete aWin[cache[whichStorage]][key];
        window.postMessage(`${whichStorage}://key`);
    };
}
init('localStorage');
init('sessionStorage');
export async function get(key, splitPath, protocol) {
    let returnObj = window[protocol].getItem(key);
    return returnObj;
}
export async function set(key, splitPath, protocol) {
    const head = splitPath.shift();
    if (head === undefined)
        throw 400;
}
