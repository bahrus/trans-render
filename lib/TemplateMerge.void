import {PMDo, RenderContext} from './types.js';
import {insertAdjacentTemplate} from './insertAdjacentTemplate.js';

export class TemplateMerge implements PMDo {
    do(ctx: RenderContext){
        const template = ctx.rhs as HTMLTemplateElement;
        let clone : Node | undefined;
        if(template.dataset.insertPosition !== 'afterend'){
            clone = template.content.cloneNode(true);
        }
        ctx.transform!(clone as HTMLElement, ctx);
        const shadowRoot = template.getAttribute('shadowroot');
        const target = ctx.target!;
        if(shadowRoot !== null){
            if(target.shadowRoot === null || target.shadowRoot.mode === shadowRoot){
                target.attachShadow({mode: shadowRoot as ShadowRootMode});
                target.appendChild(clone!);
            }else{
                target.appendChild(clone!);
            }
        }else{
            const position = (template.dataset.insertPosition || 'beforeend') as InsertPosition;
            switch(position){
                case 'beforeend':
                    target.appendChild(clone!);
                    
                    break;
                case 'afterend':
                    insertAdjacentTemplate(template, target, position);
                    break;
                default:
                    throw "Not Implemented Yet."
            }
        }
    }
}