import { TR } from './TR.js';
export { TR } from './TR.js';
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
    #initialized = false;
    async transform(fragment, fragmentManager) {
        if (!this.#initialized) {
            const { ctx } = this;
            const { match, plugins } = ctx;
            if (plugins !== undefined) {
                const { awaitTransforms, toTransformMatch } = await import('./pluginMgr.js');
                const pluggedInPlugins = await awaitTransforms(plugins);
                ctx.plugins = pluggedInPlugins;
                ctx.match = { ...match, ...toTransformMatch(pluggedInPlugins) };
            }
            this.#initialized = true;
        }
        return await super.transform(fragment, fragmentManager);
    }
    async subscribe(isPropagating = false) {
        const { host } = this.ctx;
        const { bePropagating } = await import('./bePropagating.js');
        const deps = await this.getDep();
        const fragment = host.shadowRoot || host;
        for (const key of deps) {
            const firstToken = key[0] === '.' ? this.#getFirstToken(key) : key;
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
    async do_string() {
        const { ctx } = this;
        const { plugins, rhs } = ctx;
        if (plugins !== undefined && plugins[rhs] !== undefined) {
            //method.constructor.name === 'AsyncFunction'
            const processor = plugins[rhs].processor;
            if (processor.constructor.name === 'AsyncFunction') {
                const newRHS = await processor(ctx);
                await this.doNewRHS(newRHS, ctx);
            }
            else {
                const newRHS = processor(ctx);
                await this.doNewRHS(newRHS, ctx);
            }
        }
        else {
            return await super.do_string(ctx);
        }
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
                    return await this.do_object(rc);
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
                            if (typeof Sanitizer !== undefined) {
                                const sanitizer = new Sanitizer();
                                str = sanitizer.sanitizeFor("template", str);
                            }
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
    #dependencies;
    /**
     * Gets the host properties the template depends on.
     */
    async getDep() {
        if (this.#dependencies === undefined) {
            const returnObj = new Set();
            const { ctx } = this;
            const { match } = ctx;
            for (const key in match) {
                const rhs = match[key];
                this.#getDepRHS(rhs, returnObj);
            }
            this.#dependencies = returnObj;
        }
        return this.#dependencies;
    }
    #getFirstToken(rhs) {
        const split = rhs.substring(1).split(propSplitterRegExp);
        return split[0];
    }
    #getDepRHS(rhs, returnObj) {
        switch (typeof rhs) {
            case 'string':
                if (rhs[0] === '.') {
                    returnObj.add(this.#getFirstToken(rhs));
                }
                else {
                    returnObj.add(rhs);
                }
                break;
            case 'object':
                if (Array.isArray(rhs)) {
                    switch (typeof rhs[0]) {
                        case 'string':
                            let isProp = false;
                            for (const item of rhs) {
                                if (isProp)
                                    returnObj.add(item);
                                isProp = !isProp;
                            }
                            break;
                        case 'boolean':
                            throw 'DTR1.NI'; //not implemented
                        default:
                            this.#getDepPropAttr(rhs[0], returnObj); //Prop
                            this.#getDepPropAttr(rhs[2], returnObj); //Attr
                    }
                }
                else {
                    const props = rhs.$props;
                    if (props !== undefined) {
                        //action object.
                        //convention is to specify props needed in a $props string array
                        props.forEach(s => returnObj.add(this.#getFirstToken(s)));
                    }
                }
                break;
        }
    }
    #getDepPropAttr(rhs, returnObj) {
        if (rhs === undefined)
            return;
        for (const key in rhs) {
            const item = rhs[key];
            switch (typeof item) {
                case 'string':
                    returnObj.add(item);
                    break;
                case 'object':
                    this.#getDepRHS(item, returnObj);
                    break;
            }
        }
    }
}
