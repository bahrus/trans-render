import { decorate } from './decorate.js';
export function prependTag(container, name, config) {
    const newElement = document.createElement(name);
    decorate(newElement, config);
    container.prepend(newElement);
    return newElement;
}
