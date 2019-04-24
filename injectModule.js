import { appendTag } from './appendTag';
export function injectModuleScript(script) {
    appendTag(document.head, 'script', {
        attribs: {
            type: 'module'
        },
        propVals: {
            innerHTML: script
        }
    });
}
const modulePath = Symbol('modulePath');
const lookup = {};
window[modulePath] = lookup;
export function injectModuleRef(path) {
    if (lookup[path])
        return;
    injectModuleScript(`
import '${path}';
    `);
    lookup[path] = true;
}
