import {HookupConfig} from '../ts-refs/trans-render/froop/types';
import {Mount} from '../Mount.js';

const cache = new Map<string, boolean>();

export function hookUp<T extends HTMLElement>(jsExpr: string){
    if(cache.has(jsExpr)) return;
    const guid = `a_${crypto.randomUUID()}`;
    const JSExpr = `
    document.currentScript['${guid}'] = 
        ${jsExpr}
    `;
    const script = document.createElement('script');
    script.innerHTML = JSExpr;
    document.head.appendChild(script);
    const commands = (<any>script)[guid] as HookupConfig;
    cache.set(jsExpr, true);
    const mnt = class extends Mount implements EventListenerObject {
        #commandToMethodLookup = new Map<string, string>();
        async connectedCallback(){
            await super.connectedCallback();
            for(const key in commands){
                let handler = commands[key];
                let commandType = key;
                if(Array.isArray(handler)){
                    commandType = handler[0];
                    handler = handler[1];
                }
                this.addEventListener(commandType, this);
            }
        }

        handleEvent(e: Event): void {
            const handler = this.#commandToMethodLookup.get(e.type);
            if(handler === undefined) throw 404;
            (<any>this)[handler](this, e);
        }
    }
    
    const prototype = mnt.prototype;
    for(const key in commands){
        let handler = commands[key];
        let commandType = key;
        if(Array.isArray(handler)){
            commandType = handler[0];
            handler = handler[1];
        }
        (<any>prototype)[key] = handler;
    }

    return mnt;
    
}