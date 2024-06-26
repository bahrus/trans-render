import { O } from "./O.js";
export class CustStExt {
    #acs: AbortController[] = [];
    constructor(instance: O, internals: ElementInternals, 
        public customStatesToReflect: string,
        public splitSplit: string[][]){
        this.#do(instance, internals);
    }

    async #do(instance: O, internals: ElementInternals){
        for(const statement of this.splitSplit){
            console.log({statement});
        }
    }
    
}