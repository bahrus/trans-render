import { decorate } from './plugins/decorate.js';
import { applyPeatSettings } from './init.js';
export function prependTag(container, name, config, ctx) {
    const newElement = document.createElement(name);
    if (config !== undefined) {
        if (Array.isArray(config) && ctx !== undefined) {
            applyPeatSettings(newElement, config, ctx);
        }
        else {
            decorate(newElement, config);
        }
    }
    container.prepend(newElement);
    return newElement;
}
