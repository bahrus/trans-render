import { assignGingerly } from '../lib/assignGingerly.js';
export async function push(resourcePath, val) {
    const [protocol, path] = resourcePath.split('://', 2);
    switch (protocol) {
        case 'globalThis':
            await assignGingerly(globalThis, path);
            return;
        case 'idb':
            const existingObj = await (await import('./pull.js')).pull(resourcePath) || {};
            await assignGingerly(existingObj, val);
    }
}
