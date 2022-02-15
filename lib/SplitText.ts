import {PMDo, RenderContext} from './types.js';
import {getProp} from './getProp.js';
import {lispToCamel} from './lispToCamel.js';

export class SplitText implements PMDo{
    async do({host, target, rhs, key, ctx}: RenderContext){
        const toProp = this.getToProp(key) || 'textContent';

        if(rhs === '.') {
            (<any>target!)[toProp] = host as any as string;
            return;
        }
        if(typeof rhs === 'string'){
            const {getVal} = await import ('./getVal.js');
            (<any>target!)[toProp] = getVal(host, rhs);
            return;
        }
        //rhs is an array, with first element a string
        (<any>target!)[toProp] = await interpolate(rhs, host);
        
    }

    getToProp(key: string | undefined) {
        if(!key?.endsWith(']')) return;
        const iPos = key?.lastIndexOf('[');
        if (iPos === -1)
            return;
        key = key.replace('[data-data-', '[-');
        if (key[iPos + 1] !== '-')
            return;
        key = key.substring(iPos + 2, key.length - 1);
        return lispToCamel(key);
    }

    

}

export async function interpolate(textNodes: string[], host: any){
    return textNodes.map(async (path, idx) => {
        if(idx % 2 === 0) return path;
        const {getVal} = await import ('./getVal.js');
        return await getVal(host, path) as string;
    }).join('');
}


