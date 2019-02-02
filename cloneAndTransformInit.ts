import {RenderOptions, RenderContext} from './init.d.js';
import {init} from './init.js';
export function CloneAndTransformInit(src: HTMLElement, ctx: RenderContext, target: HTMLElement | DocumentFragment, options?: RenderOptions){
    const clonedElement = src.cloneNode(true) as HTMLElement;
    init(clonedElement, ctx, target, options);
}