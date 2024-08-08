import { Specifier } from './ts-refs/trans-render/dss/types.js';  //'./dss/types.js';
import { IObject$tring } from './ts-refs/trans-render/types.js'; 

export class DSSArray implements IObject$tring{
    strVal: string | undefined;
    objVal: any;
    arrVal: any[] | undefined;
    constructor(public s: string){}


    async parse(){
        const {parse} = await import('./dss/parse.js');
        const split = this.s.split(' ').map(s => s.trim()).filter(s => !!s);
        const specifiers: Specifier[] = [];
        let lastDSS: Specifier | undefined;
        let inAsMode = false;
        for(const dss of split){
            if(dss === 'and') continue;
            if(dss === 'as'){
                inAsMode = true;
                continue;
            }
            if(lastDSS !== undefined && inAsMode){
                lastDSS.as = dss as 'Number';
                inAsMode = false;
                continue;
            }
            lastDSS = await parse(dss);
            specifiers.push(lastDSS);
        }
        this.arrVal = specifiers;
    }
}