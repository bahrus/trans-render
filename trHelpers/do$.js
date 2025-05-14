import { Scope } from '../froop/Scope.js';
export async function do$(transformer, matchingElement, scopingInstructions, uow) {
    const { name, config } = scopingInstructions;
    matchingElement.setAttribute('itemscope', name);
    if (config !== null) {
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        customElements.define(name, s);
    }
    // const {model} = transformer;
    // const prop = uow.o[0];
    // const ish = await waitForIsh(matchingElement);
    // model[prop] = ish;
    // console.log({model, prop, ish});
}
