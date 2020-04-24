import {DecorateArgs, PEAUnionSettings, PEATUnionSettings} from './init.d.js';
import {decorate} from './decorate.js';
import {applyPeatSettings} from './init.js';
export function appendTag<T extends HTMLElement>(container: HTMLElement, name: string, config?: PEAUnionSettings<T> | DecorateArgs<T>) : T{
    const newElement = document.createElement(name) as T;
    if(config !== undefined){
        if(Array.isArray(config)){
            applyPeatSettings<T>(newElement, config as PEATUnionSettings<T>);
        }else{
            decorate(newElement, config);
        }
        
    }
    container.appendChild(newElement);
    return newElement;
}
