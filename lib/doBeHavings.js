import { lispToCamel } from './lispToCamel.js';
export async function doBeHavings(instance, beHavings) {
    await customElements.whenDefined('be-enhanced');
    for (const beHaving of beHavings) {
        const { be, having, waitForResolved, beAssigned, beDeepMerged, waitForResolvedIfLoaded } = beHaving;
        if (be !== undefined) {
            const enh = 'be-' + be;
            const enhancement = lispToCamel(enh);
            const aInstance = instance;
            if (having !== undefined) {
                const base = instance.beEnhanced.by[enhancement];
                Object.assign(base, { ...having });
            }
            if (waitForResolved) {
                await instance.beEnhanced.whenDefined(enh);
            }
            else if (waitForResolvedIfLoaded) {
                if (customElements.get(enh) !== undefined) {
                    await instance.beEnhanced.whenDefined(enh);
                }
            }
        }
        if (beAssigned !== undefined) {
            Object.assign(instance, beAssigned);
        }
        if (beDeepMerged) {
            const { mergeDeep } = await import('./mergeDeep.js');
            mergeDeep(instance, beDeepMerged);
        }
    }
}
