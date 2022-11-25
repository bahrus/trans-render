import { pc } from './const.js';
export function trigger(instance, propagator, args) {
    console.debug('addPropBagListener');
    propagator.addEventListener(pc, async (e) => {
        const chg = e.detail;
        const { key, oldVal, newVal } = chg;
        console.debug({ key, oldVal, newVal });
        const { services } = args;
        const { itemizer: createPropInfos } = services;
        await createPropInfos.resolve();
        const { nonDryProps } = createPropInfos;
        if (!nonDryProps.has(key)) {
            if (oldVal === newVal)
                return;
        }
        propagator.dk.add(key);
        (async () => {
            const filteredActions = {};
            const { pq } = await import('../lib/pq.js');
            const { intersection } = await import('../lib/intersection.js');
            const config = args.config;
            const { actions } = config;
            const changedKeys = propagator.dk;
            console.debug({ changedKeys, actions });
            propagator.dk = new Set();
            let foundAction = false;
            for (const methodName in actions) {
                const action = actions[methodName];
                const props = createPropInfos.getPropsFromAction(action); //TODO:  cache this
                const int = intersection(props, changedKeys);
                if (int.size === 0)
                    continue;
                const typedAction = (typeof action === 'string') ? { ifAllOf: [action] } : action;
                if (await pq(typedAction, instance)) {
                    filteredActions[methodName] = action;
                    foundAction = true;
                }
            }
            if (foundAction) {
                const { act: doActions } = await import('./act.js');
                console.debug({ instance, filteredActions });
                doActions(instance, filteredActions);
            }
        })();
    });
}
