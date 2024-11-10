import { USLMapping } from '../ts-refs/trans-render/XV/types'
import { set } from './set.js';

export async  function stow(values: any, mapping: USLMapping){
    for(const key in mapping){
        await set(mapping[key], values[key]);
    }
}