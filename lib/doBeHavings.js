import { lispToCamel } from './lispToCamel.js';
export async function doBeHavings(instance, beHavings) {
    await customElements.whenDefined('be-enhanced');
    for (const beHaving of beHavings) {
        const { be, having, waitForResolved } = beHaving;
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
        // if(aInstance.beDecorated === undefined) aInstance.beDecorated = {};
        // const attrib = instance.getAttribute(wcName);
        // const having2  = {...having || {}};
        // if(attrib && attrib.startsWith('{')){
        //     const val = JSON.parse(attrib);
        //     Object.assign(having2, val);
        // }
        // const camelBe = lispToCamel(be);
        // let existingSettings = aInstance.beDecorated[camelBe];
        // let alreadyAttached = false;
        // if(existingSettings !== undefined){
        //     alreadyAttached = existingSettings.controller !== undefined;
        //     Object.assign(existingSettings, having2);
        // }else{
        //     aInstance.beDecorated[camelBe] = having2;
        // }
        // if(!alreadyAttached){
        //     await customElements.whenDefined(wcName);
        //     const decorator = document.createElement(wcName) as any as Attachable;
        //     decorator.attach(instance);
        // }
        // if(waitForResolved){
        //     if(existingSettings !== undefined && existingSettings.resolved) continue;
        //     const {isResolved} = await import('./isResolved.js');
        //     existingSettings = aInstance.beDecorated[camelBe];
        //     if(existingSettings !== undefined && existingSettings.resolved) continue;
        //     await isResolved(instance, ['beDecorated', be]);
        // }
    }
}
