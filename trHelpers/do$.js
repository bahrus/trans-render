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
        const vm = new s();
        const { model } = transformer;
        const prop = uow.o[0];
        Object.assign(vm, model[prop]);
        model[prop] = vm;
        matchingElement.ish = vm;
        regIsh(target, name, s);
    }
}
