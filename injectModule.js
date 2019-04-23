import { appendTag } from './appendTag';
export function injectModule(script) {
    appendTag(document.head, 'script', {
        attribs: {
            type: 'module'
        },
        propVals: {
            innerHTML: script
        }
    });
}
