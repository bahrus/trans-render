import { Specifier } from './dss/types.js';
import { IObject$tring } from './types.js';

export class DSSArray implements IObject$tring{
    strVal: string | undefined;
    objVal: any;
    arrVal: any[] | undefined;
    constructor(public s: string){}


    async parse(){
        const {parse} = await import('./dss/parse.js');
        const split = this.s.split(' ').map(s => s.trim()).filter(s => !!s);
        const specifiers: Specifier[] = [];
        for(const dss of split){
            if(dss === 'and') continue;
            specifiers.push(await parse(dss));
        }
        this.arrVal = specifiers;
    }
}