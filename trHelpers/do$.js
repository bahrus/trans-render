import { Scope } from '../froop/Scope.js';
export async function do$(mountObserver, matchingElement, scopingInstructions, uow) {
    const { name, config } = scopingInstructions;
    matchingElement.setAttribute('itemscope', name);
    if (config !== null) {
        class s extends Scope {
            static config = config;
        }
        s.bootUp();
        customElements.define(name, s);
    }
}
