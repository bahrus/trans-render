import {RenderContext} from './init.d.js';
export interface UpdateContext extends RenderContext {
    update: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => UpdateContext;
}