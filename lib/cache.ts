import {lispToCamel} from './lispToCamel.js';
let count = 0;

const map = new Map<string, any>();
const alreadyCached = new WeakSet<HTMLTemplateElement>();

export function cache(templ: HTMLTemplateElement){
    if(alreadyCached.has(templ)) return;
    alreadyCached.add(templ);
    const bes = Array.from(templ.content.querySelectorAll('[be]'));
    for(const el of bes){
        const beAttr = el.getAttribute('be');
        const newAttr = 'be-' + count++;
        try{
            const parsed = JSON.parse(beAttr!);
            map.set(newAttr, parsed);
        }catch(e){
            console.error({el, msg: "Error parsing be attribute", e});
            continue;
        }
        el.setAttribute('be', newAttr);
    }
}

function passVal(val: any, el: any, enh: string){
    const enhancement = lispToCamel(enh);
    if(el.beEnhanced === undefined) el.beEnhanced = {};
    const {beEnhanced} = el;
    beEnhanced[enh] = val;
}
export async function restore(clone: DocumentFragment){
    const bes = Array.from(clone.querySelectorAll('[be]'));
    for(const el of bes){
        const beAttr = el.getAttribute('be');
        const parsed = map.get(beAttr!);
        if(parsed === undefined) continue;
        
        for(const key in parsed){
            const val = parsed[key];
            //const isString = typeof val === 'string';
            switch(key){
                case '.':
                    Object.assign(el, parsed);
                    break;
                default:
                    const tagName = 'be-' + key;
                    passVal(val, el, tagName);
                    if(customElements.get(tagName)){
                        await (<any>el).beEnhanced.whenResolved(tagName);
                    }
            }
        }
    }
}