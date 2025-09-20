import { Specifier } from './ts-refs/trans-render/dss/types.js';  //'./dss/types.js';
import { IObject$tring } from './ts-refs/trans-render/types.js'; 

export class DSSArray implements IObject$tring{
    strVal: string | undefined;
    objVal: any;
    arrVal: any[] | undefined;
    constructor(public s: string){}


    async parse(){
        const {parse} = await import('./dss/parse.js');
        const {splitRefs} = await import('mount-observer/refid/splitRefs.js');
        const split = splitRefs(this.s);
        const specifiers: Specifier[] = [];
        let lastDSS: Specifier | undefined;
        for(const dss of split){
            if(dss === 'and') continue;
            lastDSS = await parse(dss);
            specifiers.push(lastDSS);
        }
        this.arrVal = specifiers;
    }
}