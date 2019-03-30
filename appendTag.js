import { decorate } from './decorate.js';
export function appendTag(container, name, config) {
    const newElement = document.createElement(name);
    decorate(newElement, config);
    container.appendChild(newElement);
    return newElement;
}
