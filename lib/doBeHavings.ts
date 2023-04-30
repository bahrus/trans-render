import {Attachable, BeHaving} from './types';
import { lispToCamel } from './lispToCamel.js';

export async function doBeHavings(instance: Element, beHavings: BeHaving[]){
    await customElements.whenDefined('be-enhanced');
    for(const beHaving of beHavings){
        const {be, having, waitForResolved, beAssigned, beDeepMerged, waitForResolvedIfLoaded} = beHaving;
        if(be !== undefined){
            const enh = 'be-' + be;
            const enhancement = lispToCamel(enh);
            const aInstance = instance as any;
            if(having !== undefined){
                const base = (<any>instance).beEnhanced.by[enhancement];
                Object.assign(base, {...having});
            }
            if(waitForResolved){
                await (<any>instance).beEnhanced.whenResolved(enh);
            }else if(waitForResolvedIfLoaded){
                if(customElements.get(enh) !== undefined){
                    await (<any>instance).beEnhanced.whenResolved(enh);
                }
            }
            
        }
        if(beAssigned !== undefined){
            Object.assign(instance, beAssigned);
        }
        if(beDeepMerged){
            const {mergeDeep} = await import('./mergeDeep.js');
            mergeDeep(instance, beDeepMerged);
        }

    }
}