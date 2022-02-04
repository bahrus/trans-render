import {TR} from './TR.js';
import {RenderContext} from 'types';

export class DTR extends TR{
    static new(ctx: RenderContext){
        return new DTR(ctx);
    }
    constructor(public ctx: RenderContext){
        super(ctx);
    }
    #initialized = false;
    async transform(fragment: Element | DocumentFragment){
        if(!this.#initialized){
            const {ctx} = this;
            const {match, plugins} = ctx;
            if(plugins !== undefined){
                const {awaitTransforms, toTransformMatch} = await import('./pluginMgr.js');
                const pluggedInPlugins = await awaitTransforms(plugins);
                ctx.match = {...match, ...toTransformMatch(pluggedInPlugins)};
            }
            this.#initialized = true;
        }
        return await super.transform(fragment);
    }
    async do_string(): Promise<void> {
        const {ctx} = this;
        const {plugins, rhs} = ctx;
        if(plugins !== undefined && plugins[rhs] !== undefined){
            const newRHS = plugins[rhs].processor(ctx);
            const verb = 'do_' + typeof(newRHS);
            ctx.rhs = newRHS;
            await (<any>this)[verb]();
        }else{
            return await super.do_string();
        }
    }
    async do_object(): Promise<void> {
        const rhs = this.ctx.rhs;
        if(Array.isArray(rhs)){
            return await this.do_array();
        }
        return await super.do_object();
    }
    async do_array(): Promise<void> {
        const {ctx} = this;
        const {rhs}  = ctx;
        const head = rhs[0];
        switch(typeof head){
            case 'string':
                const {SplitText} = await import('./splitText.js');
                const st = new SplitText();
                st.do(ctx);
                break;
            default:
                const len = rhs.length;
                switch(len){
                    case 1:
                        const {P} = await import('./P.js');
                        const p = new P();
                        p.do(ctx);
                        break;
                    case 2:
                        const {PE} = await import('./PE.js');
                        const pe = new PE();
                        pe.do(ctx);
                        break;
                    default:
                        const {PEA} = await import('./PEA.js');
                        const pea = new PEA();
                        pea.do(ctx);
                        break;
                }
        }
    }
}