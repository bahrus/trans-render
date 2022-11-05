import {Action, IActionProcessor, WCConfig} from '../lib/types';
import {pc} from './const.js';
import {CEArgs, IPropagator, IPropChg} from './types';


export function trigger(instance: EventTarget, propagator: IPropagator, args: CEArgs){
    //console.log('addPropBagListener');
    propagator.addEventListener(pc, async e => {
        
        const chg = (e as CustomEvent).detail as IPropChg;
        const {key, oldVal, newVal} = chg;
        //console.log({key, oldVal, newVal});
        const {services} = args;
        const {itemizer: createPropInfos} = services!;
        await createPropInfos.resolve();
        const {nonDryProps} = createPropInfos;
        if(!nonDryProps.has(key)){
            if(oldVal === newVal) return;
        }
        propagator.dk.add(key);
        (async () => {
            const filteredActions: any = {};
            const {pq} = await import('../lib/pq.js');
            const {intersection} = await import('../lib/intersection.js');
            const config = args.config as WCConfig;
            const {actions} = config;
            const changedKeys = propagator.dk;
            //console.log({changedKeys, actions});
            propagator.dk = new Set<string>();
            let foundAction = false;
            for(const methodName in actions){
                const action = actions[methodName] as string | Action;
                const props = createPropInfos.getPropsFromAction(action); //TODO:  cache this
                const int = intersection(props, changedKeys);
                if(int.size === 0) continue;
                const typedAction = (typeof action === 'string') ? {ifAllOf:[action]} as Action : action as Action;
                if(await pq(typedAction, instance)){
                    filteredActions[methodName] = action;
                    foundAction = true;
                }
            }
            if(foundAction){
                const {act: doActions} = await import('./act.js');
                //console.log({instance, filteredActions});
                doActions(instance, filteredActions);
            }
        })();
    });
}




