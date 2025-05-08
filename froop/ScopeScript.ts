//TODO:  support scoped shadow DOM
export async function ScopeScript(script: HTMLScriptElement){
    const href = script.getAttribute('href');
    if(href === null || !href.startsWith('#')) throw 300;
    const id = href.substring(1);
    const {upShadowSearch} = await import('../lib/upShadowSearch.js');
    const ref = upShadowSearch(script, id) as HTMLScriptElement;
    if(!(ref instanceof HTMLScriptElement)) throw 404;
    tbd(ref);
    
}

export function tbd(ref: HTMLScriptElement){
    const inner = ref.innerHTML;
    const ceName = ref.id;
    if(!ceName) throw 300;
    const scriptRewrite = `
import {Scope} from 'trans-render/froop/Scope.js';

class s extends Scope {
static config = ${inner};
}
s.bootUp();
customElements.define('${ceName}', s);
    `;
    const scriptEl = document.createElement('script');
    scriptEl.type = 'module';
    scriptEl.textContent = scriptRewrite;
    document.head.appendChild(scriptEl);
}