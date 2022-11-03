import { pc } from './const.js';
export function hookupActions(instance, propBag, args) {
    //console.log('addPropBagListener');
    propBag.addEventListener(pc, async (e) => {
        const chg = e.detail;
        const { key, oldVal, newVal } = chg;
        //console.log({key, oldVal, newVal});
        const { services } = args;
        const { createPropInfos } = services;
        await createPropInfos.resolve();
        const { nonDryProps } = createPropInfos;
        if (!nonDryProps.has(key)) {
            if (oldVal === newVal)
                return;
        }
        propBag.dk.add(key);
        (async () => {
            const filteredActions = {};
            const { pq } = await import('../lib/pq.js');
            const { intersection } = await import('../lib/intersection.js');
            const config = args.config;
            const { actions } = config;
            const changedKeys = propBag.dk;
            //console.log({changedKeys, actions});
            propBag.dk = new Set();
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
                const { doActions } = await import('./doActions.js');
                //console.log({instance, filteredActions});
                doActions(instance, filteredActions);
            }
        })();
    });
}
