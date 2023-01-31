import { lispToCamel } from './lispToCamel.js';
export async function doBeHavings(instance, beHavings) {
    for (const beHaving of beHavings) {
        const { be, having, waitForResolved } = beHaving;
        const wcName = 'be-' + be;
        const aInstance = instance;
        if (aInstance.beDecorated === undefined)
            aInstance.beDecorated = {};
        const attrib = instance.getAttribute(wcName);
        const having2 = { ...having || {} };
        if (attrib && attrib.startsWith('{')) {
            const val = JSON.parse(attrib);
            Object.assign(having2, val);
        }
        const camelBe = lispToCamel(be);
        const existingSettings = aInstance.beDecorated[camelBe];
        let alreadyAttached = false;
        if (existingSettings !== undefined) {
            alreadyAttached = existingSettings.controller !== undefined;
            Object.assign(existingSettings, having2);
        }
        else {
            aInstance.beDecorated[camelBe] = having2;
        }
        if (!alreadyAttached) {
            await customElements.whenDefined(wcName);
            const decorator = document.createElement(wcName);
            decorator.attach(instance);
        }
        if (waitForResolved) {
            if (existingSettings !== undefined && existingSettings.resolved)
                continue;
            const { isResolved } = await import('./isResolved.js');
            await isResolved(instance, ['beDecorated', be]);
        }
    }
}
