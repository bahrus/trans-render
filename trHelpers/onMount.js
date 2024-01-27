import { arr } from '../Transform.js';
export async function onMount(transformer, mo, matchingElement, uows, skipInit, ctx, matchingElements, observer, mountObserver) {
    const { queryInfo } = mo;
    const { hostPropToAttrMap } = queryInfo;
    if (hostPropToAttrMap !== undefined && hostPropToAttrMap.length === 1 && hostPropToAttrMap[0].type === '$') {
        const { doNestedTransforms } = await import('./doNestedTransforms.js');
        await doNestedTransforms(matchingElement, uows, mo);
        return;
    }
    for (const uow of uows) {
        //this is where we could look to see if we need to do update if already updated by server
        if (!skipInit || !ctx.initializing) {
            await mo.doUpdate(matchingElement, uow);
        }
        matchingElements.push(new WeakRef(matchingElement));
        await transformer.engage(matchingElement, 'onMount', uow, observer, ctx);
        const { a, m } = uow;
        if (a !== undefined) {
            let transpiledActions;
            if (typeof a === 'string') {
                transpiledActions = [mo.toStdEvt(a, matchingElement)];
            }
            else {
                transpiledActions = arr(a).map(ai => typeof ai === 'string' ? mo.toStdEvt(ai, matchingElement) : ai);
            }
            const { AddEventListener } = await import('./AddEventListener.js');
            for (const ap of transpiledActions) {
                const { on, do: action, options } = ap;
                new AddEventListener(mountObserver, transformer, uow, matchingElement, on, action);
            }
        }
        if (m !== undefined) {
            const transpiledMs = arr(m);
            const { Mod } = await import('./Mod.js');
            for (const mi of transpiledMs) {
                new Mod(mountObserver, transformer, matchingElement, mi);
            }
        }
    }
}
