import {RenderContext} from './init.d.js';

const spKey = '__transrender_deco_onPropsChange';
interface DecorateArgs{
    //attribs:{[key: string]: string} | undefined;
    props: {[key: string]: any} | undefined;
    methods: {[key: string] : Function} | undefined;
    on: {[key: string] : (e: Event) => void} | undefined;
    class: string | string[] | undefined;
}
function assignSpecial<T extends HTMLElement>(target: T, vals: T, propNames: string[]){
    propNames.forEach(propName =>{
        const targetProp = (<any>target)[propName];
        const srcProp = (<any>vals)[propName];
        Object.assign(targetProp, srcProp);
        delete (<any>vals)[propName];
    })
}
export function decorate<T extends HTMLElement>(target: T, vals: T | null, decor?: DecorateArgs){
    if(vals !== null) {
        const valCopy = {...vals};
        assignSpecial(target, valCopy, ['dataset', 'style']);
        Object.assign(target, valCopy);
        //classes?
    }
    if(decor === undefined) return;
    const props = decor.props;
    if(props !== undefined){
        for (const key in props) {
            if(key in target === true) throw 'Property ' + key + ' already exists.';
            const propVal = props[key];
            
            Object.defineProperty(target, key, {
                get: function () {
                    return this['_' + key];
                },
                set: function (val) {
                    this['_' + key] = val;
                    const eventName = key + '-changed';
                    const newEvent = new CustomEvent(eventName, {
                        detail: {
                            value: val
                        },
                        bubbles: true,
                        composed: false,
                    } as CustomEventInit);
                    this.dispatchEvent(newEvent);
                    if(this[spKey]) this[spKey](key, val);
                },
                enumerable: true,
                configurable: true,
            });
            (<any>target)[key] = propVal;
        }
    }
    const methods = decor.methods;
    if(methods !== undefined){
        for(const key in methods){
            const method = methods[key];
            const fnKey = (key === 'onPropsChange') ? spKey : key; 
            Object.defineProperty(target, fnKey, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: method,
            });
        }
    }
    const events = decor.on;
    if(events){
        for (const key in events) {
            const handlerKey = key + '_transRenderHandler';
            const prop = Object.defineProperty(target, handlerKey, {
                enumerable: false,
                configurable: true,
                writable: true,
                value: events[key],
            });
            target.addEventListener(key, (<any>target)[handlerKey]);
        }
    }
}