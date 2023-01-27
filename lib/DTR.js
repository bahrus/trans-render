import { TR } from './TR.js';
export { TR } from './TR.js';
//declare const Sanitizer: any;
const propSplitterRegExp = /[\|\.\s\?]/;
export class DTR extends TR {
    ctx;
    static new(ctx) {
        return new DTR(ctx);
    }
    constructor(ctx) {
        super(ctx);
        this.ctx = ctx;
    }
    getFirstToken(rhs) {
        const split = rhs.substring(1).split(propSplitterRegExp);
        return split[0];
    }
    async transform(fragment, fragmentManager) {
        const { ctx } = this;
        const { make } = ctx;
        if (make !== undefined) {
            const { makeBe } = await import('./makeBe.js');
            makeBe(fragment, make);
        }
        return await super.transform(fragment, fragmentManager);
    }
    async subscribe(isPropagating = false) {
        const { host } = this.ctx;
        const { bePropagating } = await import('./bePropagating.js');
        const deps = await this.getDep();
        const fragment = host.shadowRoot || host;
        for (const key of deps) {
            const firstToken = key[0] === '.' ? this.getFirstToken(key) : key;
            const et = isPropagating ? host : await bePropagating(host, firstToken);
            et.addEventListener(firstToken, async () => {
                await this.transform(fragment);
            });
        }
    }
    async doNewRHS(newRHS, ctx) {
        if (newRHS !== undefined) {
            const verb = 'do_' + typeof (newRHS);
            ctx.rhs = newRHS;
            await this[verb](ctx);
        }
    }
    async do_angle_bracket(ctx) {
        const { doAngleBracket } = await import('./doAngleBracket.js');
        await doAngleBracket(ctx, super.do_angle_bracket);
    }
    async do_object(rc) {
        const { rhs } = rc;
        if (Array.isArray(rhs)) {
            return await this.do_array();
        }
        else {
            const { rhs, ctx } = rc;
            if (rhs.$action === undefined) {
                const { queryInfo } = rc;
                const lhsProp = queryInfo?.lhsProp;
                if (lhsProp) {
                    const { target } = rc;
                    target[lhsProp] = rhs;
                }
                else {
                    ctx.rhs = [rhs];
                    return await this.do_array();
                }
            }
            else {
                return await super.do_object(ctx);
            }
        }
    }
    async do_object_propSum(rc) {
        const { propSum } = await import('./propSum.js');
        await propSum(rc);
    }
    async do_array() {
        const { ctx } = this;
        const { rhs } = ctx;
        const head = rhs[0];
        const ctxCopy = { ...ctx };
        ctxCopy.match = { ...ctx.match };
        switch (typeof head) {
            case 'string':
                const { SplitText } = await import('./SplitText.js');
                const st = new SplitText();
                await st.do(ctxCopy);
                break;
            case 'boolean':
                if (head) {
                    const { Conditional } = await import('./Conditional.js');
                    const c = new Conditional(this);
                    await c.do(ctxCopy);
                }
                break;
            default:
                if (Array.isArray(head)) {
                    throw 'DTR.NI';
                }
                else {
                    const len = rhs.length;
                    switch (len) {
                        case 1:
                            const { P } = await import('./P.js');
                            const p = new P();
                            await p.do(ctxCopy);
                            break;
                        case 2:
                            const { PE } = await import('./PE.js');
                            const pe = new PE();
                            await pe.do(ctxCopy);
                            break;
                        case 3:
                            const { PEA } = await import('./PEA.js');
                            const pea = new PEA();
                            await pea.do(ctxCopy);
                            this.flushCache();
                            break;
                        case 4:
                            if (typeof rhs[3] === 'string') {
                                let str = rhs[3];
                                // if(typeof Sanitizer !== undefined){
                                //     const sanitizer = new Sanitizer(); 
                                //     str = sanitizer.sanitizeFor("template", str);
                                // }
                                const templ = document.createElement('template');
                                templ.innerHTML = str;
                                rhs[3] = templ;
                                const { PEAT } = await import('./PEAT.js');
                                const peat = new PEAT();
                                this.flushCache();
                                await peat.do(ctxCopy);
                                this.flushCache();
                            }
                        default:
                            throw 'DTR2.NI'; //Not Implemented
                    }
                }
        }
    }
    #dependencies;
    /**
     * Gets the host properties the template depends on.
     */
    async getDep() {
        if (this.#dependencies === undefined) {
            const { GetDep } = await import('./GetDep.js');
            const gd = new GetDep(this);
            this.#dependencies = await gd.getAll();
        }
        return this.#dependencies;
    }
}
