import { decorate } from './decorate.js';
import { applyPeatSettings } from '../init.js';
export function appendTag(container, name, config, ctx) {
    const newElement = document.createElement(name);
    if (config !== undefined) {
        if (Array.isArray(config) && ctx !== undefined) {
            applyPeatSettings(newElement, config, ctx);
        }
        else {
            decorate(newElement, config);
        }
    }
    container.appendChild(newElement);
    return newElement;
}
