import { getProp } from '../lib/getProp.js';
export async function pull(resourcePath) {
    const [protocol, path] = resourcePath.split('://', 2);
    const splitPath = path.split('.');
    switch (protocol) {
        case 'globalThis':
            return await getProp(globalThis, splitPath);
        case 'idb':
            const storeName = splitPath.shift();
            if (storeName === undefined)
                throw 400;
            const req = indexedDB.open(storeName, 3);
            (await import('../lib/isResolved.js')).waitForEvent(req.);
            break;
        case 'session':
            const head = splitPath.shift();
            if (head === undefined)
                throw 400;
            const sessionStr = sessionStorage.getItem(head)?.trim();
            if (sessionStr === undefined)
                return undefined;
            const start = sessionStr[0];
            const last = sessionStr[-1];
            if ((start === '[' && last === ']') || (start === '{' && last === '}'))
                return JSON.parse(sessionStr);
            return sessionStr;
    }
}
