import { decorate } from './decorate.js';
import { applyPeatSettings } from './init.js';
export function appendTag(container, name, config) {
    const newElement = document.createElement(name);
    if (config !== undefined) {
        if (Array.isArray(config)) {
            applyPeatSettings(config, container);
        }
        else {
            decorate(newElement, config);
        }
    }
    container.appendChild(newElement);
    return newElement;
}
