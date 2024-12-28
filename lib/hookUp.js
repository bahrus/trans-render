import { Mount } from '../Mount.js';
const cache = new Map();
export function hookUp(jsExpr) {
    if (cache.has(jsExpr))
        return;
    const guid = `a_${crypto.randomUUID()}`;
    const JSExpr = `
    document.currentScript['${guid}'] = e => {
        with(e.target){
            ${jsExpr}
        }
    }
    `;
    const script = document.createElement('script');
    script.innerHTML = JSExpr;
    document.head.appendChild(script);
    const commands = script[guid];
    cache.set(jsExpr, true);
    const mnt = class extends Mount {
        #commandToMethodLookup = new Map();
        async connectedCallback() {
            await super.connectedCallback();
            for (const key in commands) {
                let handler = commands[key];
                let commandType = key;
                if (Array.isArray(handler)) {
                    commandType = handler[0];
                    handler = handler[1];
                }
                this.addEventListener(commandType, this);
            }
        }
        handleEvent(e) {
            const handler = this.#commandToMethodLookup.get(e.type);
            if (handler === undefined)
                throw 404;
            this[handler](this, e);
        }
    };
}
