import { Scope } from '../froop/Scope.js';
export async function do$$(transformer, matchingElement, scopedLoop, uow) {
    let templ;
    if (!(matchingElement instanceof HTMLTemplateElement)) {
        const { templify } = await import('./templify.js');
        templ = templify(matchingElement);
    }
    else {
        templ = matchingElement;
    }
    const { config, options } = scopedLoop;
    if (config !== null) {
        //TODO:  consolidate
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        const { regIsh } = await import('mount-observer/refid/regIsh.js');
        const { target } = transformer;
        regIsh(target, options.itemProp, s);
    }
    const mergedOptions = { ...defaultOptions, ...options };
    mergedOptions.seedEl = matchingElement;
    mergedOptions.itemTemplate = templ;
    const ishListContainer = matchingElement.closest('[itemscope]:not([itemscope=""])');
    if (ishListContainer !== null) {
        if (ishListContainer.ish === undefined) {
            const { waitForIsh } = await import('mount-observer/waitForIsh.js');
            console.log('waiting for ish');
            await waitForIsh(ishListContainer);
        }
        mergedOptions.ish = ishListContainer.ish;
        mergedOptions.listProp = ishListContainer.getAttribute('itemprop');
        mergedOptions.model = transformer.model;
        const { Clone$ } = await import('./Clone$.js');
        const clone$ = new Clone$(mergedOptions);
    }
}
const defaultOptions = {
    baseCrumb: 'trans-render-',
    idxStart: 0,
};
