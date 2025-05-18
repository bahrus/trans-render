import { Scope } from '../froop/Scope.js';
//import { tagTempl } from '../dss/tref/tagTempl.js';
//import {waitForIsh} from 'mount-observer/waitForIsh.js';
export async function do$(transformer, matchingElement, scopingInstructions, uow) {
    const { name, config } = scopingInstructions;
    matchingElement.setAttribute('itemscope', name);
    if (config !== null) {
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        const { regIsh } = await import('mount-observer/refid/regIsh.js');
        const { target } = transformer;
        const { model } = transformer;
        const { o } = uow; //TODO, less of a hack
        const prop = o[0];
        if (typeof (model[prop]) !== 'function') {
            const vm = new s();
            const val = model[prop];
            if (Array.isArray(val)) {
                vm.ishList = val;
            }
            else {
                Object.assign(vm, val);
            }
            model[prop] = vm;
            matchingElement.ish = vm;
        }
        else {
            const val = model[prop];
            if (Array.isArray(val)) {
                matchingElement.ishList = val;
            }
            else {
                Object.assign(matchingElement, val);
            }
        }
        regIsh(target, name, s);
    }
}
