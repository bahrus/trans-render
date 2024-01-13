const PELookup = new WeakMap();
const PETLookup = new WeakMap();
export async function act(instance, actions) {
    for (const methodName in actions) {
        const action = actions[methodName];
        const { debug, secondArg } = action;
        if (debug)
            debugger;
        const method = instance[methodName];
        if (method === undefined)
            throw {
                msg: 404, methodName, instance
            };
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await instance[methodName](instance, secondArg) : instance[methodName](instance, secondArg);
        if (ret === undefined)
            continue;
        await apply(instance, ret, methodName);
    }
}
export async function apply(instance, ret, methodName) {
    if (Array.isArray(ret)) {
        //TODO:  deprecate this in favor of attaching enhancements including be-voke
        switch (ret.length) {
            case 2:
                let pe = PELookup.get(instance);
                if (pe === undefined) {
                    const { PE } = await import('./PE.js');
                    pe = new PE();
                    PELookup.set(instance, pe);
                }
                await pe.do(instance, methodName, ret);
                break;
            case 3:
                let pet = PETLookup.get(instance);
                if (pet === undefined) {
                    const { PET } = await import('./PET.js');
                    pet = new PET();
                    PETLookup.set(instance, pet);
                }
                await pet.re(instance, methodName, ret);
        }
    }
    else {
        Object.assign(instance, ret);
    }
}
