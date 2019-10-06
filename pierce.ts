import {RenderContext, TransformRules} from './init.d.js';
import {init} from './init.js';

export function pierce<TargetType extends HTMLElement = HTMLElement>(el: TargetType, ctx: RenderContext, 
    targetTransform: TransformRules){
    customElements.whenDefined(el.localName).then(() =>{
        requestAnimationFrame(() =>{
            const newCtx = {...ctx};
            newCtx.Transform = targetTransform;
            init(el.shadowRoot!, newCtx);
        })
    })
}