export async function act(instance, actions) {
    for (const methodName in actions) {
        const action = actions[methodName];
        if (action.debug)
            debugger;
        const method = instance[methodName];
        if (method === undefined)
            throw {
                msg: 404, methodName, instance
            };
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await instance[methodName](instance) : instance[methodName](instance);
        if (ret === undefined)
            continue;
        if (Array.isArray(ret)) {
            const { PE } = await import('./PE.js');
            const pe = new PE();
            pe.do(instance, method, ret);
        }
        else {
            Object.assign(instance, ret);
        }
    }
}
