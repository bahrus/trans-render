import {RenderContext} from './init.d.js';

const spKey = '__transrender_deco_onPropsChange';
interface DecorateArgs<T extends HTMLElement>{
    propVals: T | undefined,
    props: {[key: string]: any} | undefined;
}
export function decorate<T extends HTMLElement>(ctx: RenderContext, target: T, src: DecorateArgs<T>, ){
    if(src.propVals !== undefined) Object.assign(target, src);
    if(ctx !== undefined && ctx.update) return;
    const props = src.props;
    if(props !== undefined){
        for (const key in props) {
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
}