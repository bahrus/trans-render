import {protocols} from '../ts-refs/trans-render/XV/types.js';
//import {getProp} from '../lib/getProp.js';

const cache = {
    sessionStorage: Symbol.for('yx84OGtTMU2GufafFtsZLw'),
    localStorage: Symbol.for('eFljX6VSOkOAmcNJyph1sw')
};
const initialized = {
    sessionStorage: Symbol('1IBxCFcbCUW3KQllamedmw'),
    localStorage: Symbol('H2lL+vYErUGixatKub3nWA')
};

const isLoaded = (<any>navigator).deviceMemory > 1;

export function init(whichStorage: 'sessionStorage' | 'localStorage', win: Window = window, ){
    const aWin = win as any;
    const initializedKey = initialized[whichStorage];
    if(aWin[initializedKey]) return;
    aWin[initializedKey] = true;
    if(!aWin[cache[whichStorage]] && isLoaded){
        aWin[cache[whichStorage]] = {};
    }
    
    if(isLoaded){
        const originalGetItem = win[whichStorage].getItem;
        const boundGetItem = originalGetItem.bind(win[whichStorage]);
        win[whichStorage].getItem = function(key: string){
            const item = boundGetItem(key);
            if(item === null) return null;
            if(!isLoaded) return item;
            const fromCache = aWin[whichStorage][key];
            if(fromCache) return aWin[whichStorage];
            try{
                aWin[whichStorage][key] = JSON.parse(item);
                return aWin[whichStorage][key];
            }catch(e){
                return item;
            }
        }
    }
    
    
    const originalSetItem = win[whichStorage].setItem;
    const boundSetItem = originalSetItem.bind(win[whichStorage]);
    win[whichStorage].setItem = function(key: string, val: any){
        const oldVal = sessionStorage.getItem(key);
        if(!isLoaded){
            boundSetItem(key, val);
        }else{
            switch(typeof val){
                case 'string':
                    boundSetItem(key, val);
                    break;
                case 'object':
                    const newVal = JSON.stringify(val);
                    if(newVal === oldVal) return;
                    aWin[whichStorage][key] = val;
                    boundSetItem(key, newVal);
                    break;
                default:
                    throw "Not Implemented";
            }
        }
        window.postMessage(`${whichStorage}://key`);
    }

    const originalRemoveItem = win.sessionStorage.removeItem;
    const boundRemoveItem = originalRemoveItem.bind(win.sessionStorage);
    win.sessionStorage.removeItem = function(key: string){
        const oldVal = sessionStorage.getItem(key);
        boundRemoveItem(key);
        if(isLoaded) delete aWin[cache[whichStorage]][key];
        window.postMessage(`${whichStorage}://key`);
    }
}

init('localStorage');
init('sessionStorage');

export async function get(key: string, splitPath: Array<string>, protocol: 'sessionStorage' | 'localStorage'){
    let returnObj = window[protocol].getItem(key);
    return returnObj;
    
}

export async function set(key: string, splitPath: Array<string>, protocol: 'sessionStorage' | 'localStorage'){
    const head = splitPath.shift();
    if(head === undefined) throw 400;

}