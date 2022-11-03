import {Action, IActionProcessor, WCConfig} from '../lib/types';
import {pc} from './const.js';
import {DefineArgsWithServices, IPropBag, IPropChg} from './types';


export function hookupActions(instance: EventTarget, propBag: IPropBag, args: DefineArgsWithServices){
    //console.log('addPropBagListener');
    propBag.addEventListener(pc, async e => {
        
        const chg = (e as CustomEvent).detail as IPropChg;
        const {key, oldVal, newVal} = chg;
        //console.log({key, oldVal, newVal});
        const {services} = args;
        const {createPropInfos} = services!;
        await createPropInfos.resolve();
        const {nonDryProps} = createPropInfos;
        if(!nonDryProps.has(key)){
            if(oldVal === newVal) return;
        }
        propBag.dk.add(key);
        (async () => {
            const filteredActions: any = {};
            const {pq} = await import('../lib/pq.js');
            const {intersection} = await import('../lib/intersection.js');
            const config = args.config as WCConfig;
            const {actions} = config;
            const changedKeys = propBag.dk;
            //console.log({changedKeys, actions});
            propBag.dk = new Set<string>();
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
                const {doActions} = await import('./doActions.js');
                //console.log({instance, filteredActions});
                doActions(instance, filteredActions);
            }
        })();
    });
}




