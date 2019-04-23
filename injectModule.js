import { appendTag } from './appendTag';
export function injectModule(path) {
    appendTag(document.head, 'script', {
        attribs: {
            type: 'module'
        },
        propVals: {
            innerHTML: `
            import "${path}";
            `
        }
    });
}
