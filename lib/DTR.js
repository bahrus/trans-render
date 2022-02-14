import { TR } from './TR.js';
export { TR } from './TR.js';
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
    async transform(fragment) {
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
        return await super.transform(fragment);
    }
    async subscribe() {
        const { host } = this.ctx;
        const { subscribe } = await import('./subscribe.js');
        const deps = this.dep;
        const fragment = host.shadowRoot || host;
        for (const key of deps) {
            await subscribe(host, key, async () => {
                await this.transform(fragment);
            });
        }
        //}
    }
    async do_string() {
        const { ctx } = this;
        const { plugins, rhs } = ctx;
        if (plugins !== undefined && plugins[rhs] !== undefined) {
            const newRHS = plugins[rhs].processor(ctx);
            if (newRHS !== undefined) {
                const verb = 'do_' + typeof (newRHS);
                ctx.rhs = newRHS;
                await this[verb]();
            }
        }
        else {
            return await super.do_string();
        }
    }
    async do_object() {
        const { rhs } = this.ctx;
        if (Array.isArray(rhs)) {
            return await this.do_array();
        }
        else {
            return await super.do_object();
        }
    }
    async do_array() {
        const { ctx } = this;
        const { rhs } = ctx;
        const head = rhs[0];
        const ctxCopy = { ...ctx };
        ctxCopy.match = { ...ctx.match };
        switch (typeof head) {
            case 'string':
                const { SplitText } = await import('./splitText.js');
                const st = new SplitText();
                await st.do(ctxCopy);
                break;
            default:
                const len = rhs.length;
                switch (len) {
                    case 1:
                        const { P } = await import('./P.js');
                        const p = new P();
                        p.do(ctxCopy);
                        break;
                    case 2:
                        const { PE } = await import('./PE.js');
                        const pe = new PE();
                        pe.do(ctxCopy);
                        break;
                    default:
                        const { PEA } = await import('./PEA.js');
                        const pea = new PEA();
                        pea.do(ctxCopy);
                        break;
                }
        }
    }
    #dependencies;
    /**
     * Gets the host properties the template depends on.
     */
    get dep() {
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
    #getDepRHS(rhs, returnObj) {
        switch (typeof rhs) {
            case 'string':
                if (rhs[0] === '.') {
                    throw 'TODO';
                }
                returnObj.add(rhs);
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
                        default:
                            this.#getDepPropAttr(rhs[0], returnObj); //Prop
                            this.#getDepPropAttr(rhs[2], returnObj); //Attr
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
