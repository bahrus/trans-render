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
            try {
                const evt = (await import('../lib/waitForEvent.js')).waitForEvent(req, 'success', 'error');
                const db = evt.target.result;
                const transaction = db.transaction([storeName], 'readonly');
                const objectStore = transaction.objectStore(storeName);
                return objectStore.get('myKey');
            }
            catch (err) {
                return undefined;
            }
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
