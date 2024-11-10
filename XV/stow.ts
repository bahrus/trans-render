import { SavingContext, USLMapping } from '../ts-refs/trans-render/XV/types'
import { set } from './set.js';

export async  function stow(values: any, mapping: USLMapping){
    const ctx: SavingContext = {
        USLs: []
    };
    for(const key in mapping){
        await set(mapping[key], values[key], ctx);
    }
    window.postMessage([ctx.USLs]);
}