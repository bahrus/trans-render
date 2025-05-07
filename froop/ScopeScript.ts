//TODO:  support scoped shadow DOM
export async function scopeScript(script: HTMLScriptElement){
    const href = (<any>script).href as string;;
    if(href === undefined || !href.startsWith('#')) throw 300;
    const id = href.substring(1);
    const {upShadowSearch} = await import('../lib/upShadowSearch.js');
    const ref = upShadowSearch(script, id) as HTMLScriptElement;
    if(!(ref instanceof HTMLScriptElement)) throw 404;
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