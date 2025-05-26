import { Scope } from '../froop/Scope.js';
export async function do$(transformer, matchingElement, scopingInstructions, uow) {
    const { name, config } = scopingInstructions;
    console.log('do$');
    if (config !== null) {
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        const { regIsh } = await import('mount-observer/refid/regIsh.js');
        const { target } = transformer;
        regIsh(target, name, s);
        const { Newish } = await import('mount-observer/Newish.js');
        const { assignGingerly } = await import('../lib/assignGingerly.js');
        const { model } = transformer;
        const { o } = uow; //TODO, less of a hack
        const prop = o[0];
        const val = model[prop];
        if (val instanceof s)
            return;
        const n = new Newish(matchingElement, matchingElement, name, {
            ctr: s,
            assigner: assignGingerly,
            csr: true,
            initPropVals: val,
        });
        const ce = await n.do();
        if (!Array.isArray(val)) {
            model[prop] = ce;
        }
        else {
            ce.model = model; //TODO use symbol
            //debugger;
            //model[prop] = Array.from(ce);
        }
        //should this be done before the ish event is raised in Newish.#assignGingerly?
        matchingElement.setAttribute('itemscope', name);
    }
}
