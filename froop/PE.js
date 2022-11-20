export class PE {
    #abortControllers = new Map();
    async do(instance, originMethodName, vals) {
        this.disconnect(originMethodName);
        instance.addEventListener('disconnected-callback', e => {
            this.disconnectAll();
        }, { once: true });
        if (vals[0] !== undefined) {
            Object.assign(instance, vals[0]);
        }
        if (vals[1] !== undefined) {
            for (const methodName in vals[1]) {
                const ec = vals[1][methodName];
                const { of, doInit, on } = ec;
                if (!(of instanceof EventTarget))
                    throw { ec };
                const ac = new AbortController();
                const method = instance[methodName];
                const isAsync = method.constructor.name === 'AsyncFunction';
                //console.log({method, isAsync, key, ec});
                of.addEventListener(on, async (e) => {
                    const ret = isAsync ? await instance[methodName](instance, e) : instance[methodName](instance, e);
                    //console.log({ret});
                    await this.recurse(instance, methodName, ret);
                }, { signal: ac.signal });
                this.#abortControllers.get(originMethodName).push(ac);
                if (doInit) {
                    const ret = isAsync ? await instance[methodName](instance) : instance[methodName](instance);
                    await this.recurse(instance, methodName, ret);
                }
            }
        }
    }
    async recurse(instance, methodName, ret) {
        if (ret === undefined)
            return;
        const arg = (Array.isArray(ret) ? ret : [ret]);
        const pe = new PE();
        await pe.do(instance, methodName, arg);
    }
    disconnectAll() {
        for (const key of this.#abortControllers.keys()) {
            this.disconnect(key);
        }
    }
    disconnect(methodName) {
        if (this.#abortControllers.has(methodName)) {
            const abortControllers = this.#abortControllers.get(methodName);
            for (const c of abortControllers) {
                c.abort();
            }
        }
        this.#abortControllers.set(methodName, []);
    }
}
