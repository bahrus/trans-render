import { camelToLisp } from './camelToLisp.js';
import { def } from './def.js';
export function register({ selector, processor }) {
    const cls = class extends HTMLElement {
        static is = camelToLisp(selector);
        static ready = true;
        static processor = processor;
        static selector = selector;
    };
    def(cls);
}
export async function awaitTransforms(plugins) {
    const returnObj = {};
    for (const key in plugins) {
        const plugin = plugins[key];
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
            returnObj[key] = plugin;
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
    }
    return returnObj;
}
