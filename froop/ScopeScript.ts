//TODO:  support scoped shadow DOM
export async function ScopeScript(script: HTMLScriptElement){
    const href = script.getAttribute('href');
    if(href === null || !href.startsWith('#')) return;
    const id = href.substring(1);
    await ScopeScriptImpl(script, id);
    
}

async function ScopeScriptImpl(script: HTMLScriptElement, id: string){
    const scriptImplId = `${id}-impl`;
    if(document.getElementById(scriptImplId) !== null) return;
    const {upShadowSearch} = await import('../lib/upShadowSearch.js');
    const ref = upShadowSearch(script, id) as HTMLScriptElement;
    if(!(ref instanceof HTMLScriptElement)) throw 404;
    if(document.getElementById(scriptImplId) !== null) return;
    const inner = ref.innerHTML;
    const ceName = ref.id;
    if(!ceName) throw 300;
    const scriptImplInner = `
import {Scope} from 'trans-render/froop/Scope.js';
import {regIsh} from 'mount-observer/refid/regIsh.js'; 

class s extends Scope {
static config = ${inner};
}
s.bootUp();
regIsh(document.body, '${ceName}', s);
    `;
    const scriptImpl = document.createElement('script');
    scriptImpl.type = 'module';
    scriptImpl.id = scriptImplId;
    scriptImpl.textContent = scriptImplInner;
    document.head.appendChild(scriptImpl);
    await ScopeScript(ref);
}