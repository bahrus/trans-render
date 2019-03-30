import {DecorateArgs} from './init.d.js';
import {decorate} from './decorate.js';
export function appendTag(container: HTMLElement, name: string, config: DecorateArgs) : HTMLElement{
    const newElement = document.createElement(name);
    decorate(newElement, config);
    container.appendChild(newElement);
    return newElement;
}
