import {CE} from './CE.js';
import {Action} from './types';
const QLookup = new WeakMap<any, Q>();

export async function doActions(self: CE, actions: {[methodName: string]: Action}, target: any, proxy?: any){
    if(!QLookup.has(target)){
        QLookup.set(target, new Q());
    }
    const q = QLookup.get(target)!;
    if(q.aip){
        Object.assign(q.aq, actions);
        q.aiq = true;
        return;
    }
    q.aip = true;
    for(const methodName in actions){
        const action = actions[methodName];
        if(action.debug) debugger;
        //https://lsm.ai/posts/7-ways-to-detect-javascript-async-function/#:~:text=There%205%20ways%20to%20detect%20an%20async%20function,name%20property%20of%20the%20AsyncFunction%20is%20%E2%80%9CAsyncFunction%E2%80%9D.%202.
        const method = (<any>target)[methodName];
        if(method === undefined){
            throw {
                message: 404,
                methodName,
                target,
            }
        }
        const isAsync = method.constructor.name === 'AsyncFunction';
        const ret = isAsync ? await (<any>target)[methodName](target) : (<any>target)[methodName](target);
        if(ret === undefined) continue;
        await self.postHoc(self, action, target, ret, proxy);
    }
    q.aip = false;
    if(q.aiq){
        q.aiq = false;
        const actionQueue = {...q.aq};
        q.aq = {};
        await self.doActions(self, actionQueue, target, proxy);
    }
}

class Q{
    aq: {[methodName: string]: Action} = {}; //actionsQueue
    aip = false; //actions in progress
    aiq = false; //actionsInQueue
}