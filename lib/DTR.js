import { TR } from './TR.js';
export { TR } from './TR.js';
import { subscribe } from './subscribe.js';
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
        let subscribed = true;
        if (!this.#initialized) {
            subscribed = false;
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
        const ctx = await super.transform(fragment);
        const { host } = ctx;
        if (!subscribed && host instanceof Element) {
            const deps = this.dep;
            const fragment = host.shadowRoot || host;
            for (const key of deps) {
                await subscribe(host, key, async () => {
                    await this.transform(fragment);
                });
            }
        }
        return ctx;
    }
    async do_string() {
        const { ctx } = this;
        const { plugins, rhs } = ctx;
        if (plugins !== undefined && plugins[rhs] !== undefined) {
            const newRHS = plugins[rhs].processor(ctx);
            const verb = 'do_' + typeof (newRHS);
            ctx.rhs = newRHS;
            await this[verb]();
        }
        else {
            return await super.do_string();
        }
    }
    async do_object() {
        const rhs = this.ctx.rhs;
        if (Array.isArray(rhs)) {
            return await this.do_array();
        }
        return await super.do_object();
    }
    async do_array() {
        const { ctx } = this;
        const { rhs } = ctx;
        const head = rhs[0];
        switch (typeof head) {
            case 'string':
                const { SplitText } = await import('./splitText.js');
                const st = new SplitText();
                st.do(ctx);
                break;
            default:
                const len = rhs.length;
                switch (len) {
                    case 1:
                        const { P } = await import('./P.js');
                        const p = new P();
                        p.do(ctx);
                        break;
                    case 2:
                        const { PE } = await import('./PE.js');
                        const pe = new PE();
                        pe.do(ctx);
                        break;
                    default:
                        const { PEA } = await import('./PEA.js');
                        const pea = new PEA();
                        pea.do(ctx);
                        break;
                }
        }
    }
    /**
     * Gets the host properties the template depends on.
     */
    get dep() {
        const returnObj = new Set();
        const { ctx } = this;
        const { match } = ctx;
        for (const key in match) {
            const rhs = match[key];
            switch (typeof rhs) {
                case 'string':
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
                        }
                    }
                    break;
            }
        }
        return returnObj;
    }
}
