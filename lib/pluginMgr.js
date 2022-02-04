import { camelToLisp } from './camelToLisp.js';
import { def } from './def.js';
export function register({ selector, processor }) {
    const cls = class extends HTMLElement {
        static is = camelToLisp(selector);
        static ready = true;
        static processor = processor;
        static selector = selector;
        static states = new WeakMap();
    };
    def(cls);
}
export async function awaitTransforms(plugins) {
    const returnObj = {};
    for (const key in plugins) {
        const plugin = plugins[key];
        if (plugin === true) {
            const ceName = camelToLisp(key + 'Attribs');
            const ce = customElements.get(ceName);
            if (ce) {
                returnObj[key] = ce;
            }
        }
        else {
            const { selector, processor, blockWhileWaiting } = plugin;
            if (typeof (processor) === 'function' || selector === undefined) {
                plugin.ready = true;
                returnObj[key] = plugin;
                continue;
            }
            const ceName = camelToLisp(selector);
            if (blockWhileWaiting) {
                const ce = await customElements.whenDefined(ceName);
                returnObj[key] = ce;
                continue;
            }
            else {
                returnObj[key] = customElements.get(ceName) || plugin;
            }
        }
    }
    return returnObj;
}
export function toTransformMatch(plugins) {
    const returnObj = {};
    for (const key in plugins) {
        const { ready, selector } = plugins[key];
        if (!ready || selector === undefined)
            continue;
        returnObj[selector] = key;
        if (selector.startsWith('be-')) {
            returnObj[`data-${selector}`] = key;
        }
    }
    return returnObj;
}
