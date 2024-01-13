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
        if (typeof ret !== 'object')
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
        //Object.assign(instance, ret);
        assign(instance, ret);
    }
}
export function assign(instance, ret) {
    for (const key in ret) {
        const val = ret[key];
        if (instance instanceof Element && key.startsWith('* ')) {
            //untested
            const matches = Array.from(instance.querySelectorAll(key.substring(2)));
            for (const match of matches) {
                assign(match, ret);
            }
            continue;
        }
        else if (key.startsWith('+')) {
            //untested
            if (instance.beEnhanced === undefined) {
                instance.beEnhanced = {};
            }
            const { beEnhanced } = instance;
            const path = key.substring(1);
            if (beEnhanced[path] === undefined) {
                beEnhanced[path] = {};
            }
            const enhancement = beEnhanced[path];
            assign(enhancement, ret);
            throw 'NI';
            continue;
        }
        else if (instance instanceof HTMLElement) {
            switch (key) {
                case 'style':
                case 'dataset':
                    assign(instance[key], val);
                    continue;
            }
        }
        instance[key] = val;
    }
}
