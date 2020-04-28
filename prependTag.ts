import {DecorateArgs} from './types.js';
import {decorate} from './decorate.js';
export function prependTag(container: HTMLElement, name: string, config: DecorateArgs) : HTMLElement{
    const newElement = document.createElement(name);
    decorate(newElement, config);
    container.prepend(newElement);
    return newElement;
    
}