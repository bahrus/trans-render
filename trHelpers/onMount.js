import { arr0 } from '../Transform.js';
export async function onMount(transformer, mo, matchingElement, uows, skipInit, ctx, matchingElements, observer, mountObserver) {
    //matchingElements.push(new WeakRef(matchingElement));
    const { queryInfo } = mo;
    const { hostPropToAttrMap } = queryInfo;
    if (hostPropToAttrMap !== undefined && hostPropToAttrMap.length === 1) {
        const [first] = hostPropToAttrMap;
        const { type, name } = first;
        if (type === '$') {
            const { model } = transformer;
            const subModel = model[name];
            if (subModel === undefined) {
                model.propagator.addEventListener(name, e => {
                    onMount(transformer, mo, matchingElement, uows, skipInit, ctx, matchingElements, observer, mountObserver);
                }, { once: true });
                return;
            }
            if (Array.isArray(subModel)) {
                const { ForEachImpl, forEachImpls } = await import('./ForEachImpl.js');
                let forEachImpl;
                if (forEachImpls.has(matchingElement)) {
                    throw 'NI';
                }
                else {
                    forEachImpl = new ForEachImpl(matchingElement, uows, mo);
                    forEachImpls.set(matchingElement, forEachImpl);
                    await forEachImpl.init();
                }
            }
            else {
                const { doNestedTransforms } = await import('./doNestedTransforms.js');
                await doNestedTransforms(matchingElement, first, subModel, uows, mo);
            }
            //return;
        }
    }
    for (const uow of uows) {
        const { w, y, $, $$, o } = uow;
        const no = o === undefined || (Array.isArray(o) && o.length === 0);
        if (w !== undefined) {
            switch (typeof w) {
                case 'string':
                    if (!matchingElement.matches(w))
                        continue;
            }
        }
        if (y !== undefined) {
            const { doYield } = await import('./doYield.js');
            await doYield(transformer, matchingElement, uow, y);
        }
        else {
            if ($ !== undefined) {
                const { do$ } = await import('./do$.js');
                await do$(transformer, matchingElement, $, uow);
                continue;
            }
            if ($$ !== undefined) {
                const { do$$ } = await import('./do$$.js');
                await do$$(transformer, matchingElement, $$, uow);
            }
            //this is where we could look to see if we need to do update if already updated by server
            if (!no && (!skipInit || !ctx.initializing)) {
                await mo.doUpdate(matchingElement, uow);
            }
        }
        await transformer.engage(matchingElement, 'onMount', uow, observer, ctx);
        const { a, m } = uow;
        if (a !== undefined) {
            let transpiledActions;
            if (a === 0) {
                const { q } = uow;
                const method = q.split(' ').at(-1);
                transpiledActions = [mo.toStdEvt(method, matchingElement)];
            }
            else {
                if (typeof a === 'string') {
                    transpiledActions = [mo.toStdEvt(a, matchingElement)];
                }
                else {
                    transpiledActions = arr0(a).map(ai => typeof ai === 'string' ? mo.toStdEvt(ai, matchingElement) : ai);
                }
            }
            const { AddEventListener } = await import('./AddEventListener.js');
            for (const transpiledAction of transpiledActions) {
                const { on, do: action, options } = transpiledAction;
                new AddEventListener(mountObserver, transformer, uow, matchingElement, on, action);
            }
        }
        if (m !== undefined) {
            const transpiledMs = arr0(m);
            const { Mod } = await import('./Mod.js');
            for (const mi of transpiledMs) {
                new Mod(mountObserver, transformer, matchingElement, mi);
            }
        }
    }
}
