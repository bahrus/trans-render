import { Scope } from '../froop/Scope.js';
export async function do$$(transformer, matchingElement, scopedLoop, uow) {
    console.log('starting do$$');
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
        // const {model} = transformer as {model: any};
        // const {o} = uow as {o: string[]}; //TODO, less of a hack
        // const prop = o[0];
        // const val = model[prop];
        // if(typeof(model[prop]) !== 'function'){
        //     const vm = new s();
        //     if(Array.isArray(val)){
        //         (<any>vm).ishList = val;
        //     }else{
        //         Object.assign(vm, val);
        //     }
        //     model[prop] = vm;
        //     (<any>matchingElement).ish = vm;
        // }else{
        //     if(Array.isArray(val)){
        //         (<any>matchingElement).ishList = val;
        //     }else{
        //         Object.assign(<any>matchingElement, val);
        //     }
        // }
        regIsh(target, options.itemProp, s);
    }
    const { Clone$ } = await import('./Clone$.js');
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
        console.log('finished waiting for ish');
        mergedOptions.ish = ishListContainer.ish;
        const clone$ = new Clone$(mergedOptions);
    }
}
const defaultOptions = {
    baseCrumb: 'trans-render-',
    idxStart: 0,
};
