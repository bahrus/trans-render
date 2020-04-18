import {CreateTemplateOptions} from './init.d.js';
function doeth(html: string){
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = html;
    return template;
}
export function createTemplate(html: string, options?: CreateTemplateOptions): HTMLTemplateElement {
    let template : HTMLTemplateElement;
    if(options !== undefined){
        const ctx = options.ctx;
        const as = options.as;
        if(ctx !== undefined && as !== undefined){
            if(ctx.templates === undefined) ctx.templates = {};
            if(ctx.templates[as] === undefined) {
                ctx.templates[as] = doeth(html);
            }
            template =ctx.templates[as];
        }else{
            template = doeth(html);
        }
        if(options.shadow){
            (<any>template)['_attachShadowOptions'] = options.shadow;
        }
        return template;
    }
    return doeth(html);
}