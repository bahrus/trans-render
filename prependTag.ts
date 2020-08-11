import {DecorateArgs, PEAUnionSettings, PEATUnionSettings, RenderContext} from './types_old.js';
import {decorate} from './plugins/decorate.js';
import {applyPeatSettings} from './init.js';
export function prependTag<T extends HTMLElement = HTMLElement>(container: HTMLElement, name: string, config?: PEAUnionSettings<T> | DecorateArgs<T>, ctx?: RenderContext) : T{
    const newElement = document.createElement(name) as T;
    if(config !== undefined){
        if(Array.isArray(config) && ctx !== undefined){
            applyPeatSettings<T>(newElement, config as PEATUnionSettings<T>, ctx);
        }else{
            decorate(newElement, config as DecorateArgs<T>);
        }
        
    }
    container.prepend(newElement);
    return newElement;
}
