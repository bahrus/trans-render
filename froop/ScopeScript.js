//TODO:  support scoped shadow DOM
export async function ScopeScript(script) {
    const href = script.getAttribute('href');
    if (href === null || !href.startsWith('#'))
        return;
    const id = href.substring(1);
    await ScopeScriptImpl(script, id);
}
async function ScopeScriptImpl(script, id) {
    const scriptImplId = `${id}-impl`;
    if (document.getElementById(scriptImplId) !== null)
        return;
    const { upShadowSearch } = await import('../lib/upShadowSearch.js');
    const ref = upShadowSearch(script, id);
    if (!(ref instanceof HTMLScriptElement))
        throw 404;
    if (document.getElementById(scriptImplId) !== null)
        return;
    const inner = ref.innerHTML;
    const ceName = ref.id;
    if (!ceName)
        throw 300;
    const scriptImplInner = `
import {Scope} from 'trans-render/froop/Scope.js';

class s extends Scope {
static config = ${inner};
}
s.bootUp();
customElements.define('${ceName}', s);
    `;
    const scriptImpl = document.createElement('script');
    scriptImpl.type = 'module';
    scriptImpl.id = scriptImplId;
    scriptImpl.textContent = scriptImplInner;
    document.head.appendChild(scriptImpl);
    await ScopeScript(ref);
}
