import { pc } from './const.js';
import { pq } from './pq.js';
import { intersects } from '../lib/intersects.js';
import { act } from './act.js';
const cache = new Map();
export function trigger(instance, propagator, args) {
    //console.debug('addPropBagListener');
    propagator.addEventListener(pc, e => {
        const chg = e.detail;
        const { key, oldVal, newVal } = chg;
        //console.debug({key, oldVal, newVal});
        const { services, asides } = args;
        const { itemizer: createPropInfos } = services;
        //await createPropInfos.resolve();
        const { nonDryProps } = createPropInfos;
        if (!nonDryProps.has(key)) {
            if (oldVal === newVal && propagator.mk.has(key))
                return;
        }
        propagator.dk.add(key);
        propagator.mk.add(key);
        //console.debug({key, oldVal, newVal});
        const filteredActions = {};
        // const {pq} = await import('../lib/pq.js');
        // const {intersection} = await import('../lib/intersection.js');
        const config = args.config;
        const { actions } = config;
        const changedKeys = propagator.dk;
        //console.debug({changedKeys, actions});
        propagator.dk = new Set();
        let foundAction = false;
        const ctr = instance.constructor;
        if (!cache.has(ctr)) {
            cache.set(ctr, new Map());
        }
        const propLookup = cache.get(ctr);
        for (const methodName in actions) {
            const action = actions[methodName];
            let props = propLookup.get(methodName);
            if (props === undefined) {
                props = createPropInfos.getPropsFromAction(action);
                propLookup.set(methodName, props);
            }
            if (!intersects(props, changedKeys))
                continue;
            const typedAction = (typeof action === 'string') ? { ifAllOf: [action] } : action;
            if (pq(typedAction, instance)) {
                filteredActions[methodName] = action;
                if (asides !== undefined) {
                    const aside = asides[methodName];
                    if (aside !== undefined) {
                        //do asynchronous side effect
                        aside(instance, methodName, key);
                    }
                }
                foundAction = true;
            }
        }
        if (foundAction) {
            //const {act: doActions} = await import('./act.js');
            //console.debug({instance, filteredActions});
            act(instance, filteredActions);
        }
    });
}
