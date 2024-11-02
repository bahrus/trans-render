import { WrapperConfig, USL } from "../ts-refs/trans-render/XV/types";

export class Wrapper<TProp = any>{
    isStale = true;
    cachedVal: any;
    asOf = 0;
    usl: USL;
    constructor(public owner: TProp, public cfg: WrapperConfig){
        const {USPProp, accessor} = cfg;
        this.usl = (USPProp + accessor) as USL;
    }

    async value(newVal?: TProp): Promise<TProp | void> {
        const {usl, cfg, cachedVal, asOf} = this;
        const {cache, maxStaleness} = cfg;
        if(newVal === undefined){
            if(cache && cachedVal !== undefined){
                if(maxStaleness && asOf){
                    if((new Date()).valueOf() - asOf < maxStaleness){
                        return cachedVal;
                    }
                }
            }
            //this is a get
            const {get} = await import('./get.js');
            const val = await get(usl);
            if(cache){
                this.cachedVal = val;
                this.asOf = (new Date()).valueOf();
            }
            return val;
        }else{
            //save
            if(cache){
                this.cachedVal = newVal;
                this.asOf = (new Date()).valueOf();
            }
            const {set} = await import('./set.js');
            await set(usl, newVal);
        }
    }
}