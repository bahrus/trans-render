import { RenderContext, DecorateArgs, TransformValueOptions } from "./init.d.js";
import {domAssign} from './domAssign.js';

// export const attribs = Symbol('attribs');

// export interface HasAttribsextends HTMLElement{
//   [attribs]?: {[key: string] : string | boolean};
// }


function defProp(key: string | symbol, props: any, target: any, onPropsChange: symbol){
  const propVal = props[key];
  const keyS = key.toString();
  const localSym = Symbol(key.toString());
  Object.defineProperty(target, key, {
    get: function() {
      return this[localSym];
    },
    set: function(val) {
      this[localSym] = val;
      const eventName = keyS.replace('(', '-').replace(')', '') + "-changed";
      const newEvent = new CustomEvent(eventName, {
        detail: {
          value: val
        },
        bubbles: true,
        composed: false
      } as CustomEventInit);
      this.dispatchEvent(newEvent);
      //this.dataset[]
      if(this.toggleAttribute) this.toggleAttribute('data-' + eventName);
      if(this[onPropsChange]) this[onPropsChange](key, val);
      //if (this[spKey]) this[spKey](key, val);
    },
    enumerable: true,
    configurable: true
  });
  (<any>target)[key] = propVal;
}
function defMethod(key: string | symbol, methods: any, target: any, onPropsChange: symbol){
  const method = methods[key];
  const fnKey = key === "onPropsChange" ? onPropsChange : key;
  Object.defineProperty(target, fnKey, {
    enumerable: false,
    configurable: true,
    writable: true,
    value: method
  });
}
export function decorate(
  target: HTMLElement,
  source: DecorateArgs
) {
  const onPropsChange = Symbol('onPropChange');
  domAssign(target, source);
  
  const props = source.propDefs;
  if (props !== undefined) {
    for (const key in props) {
      //if (props[key]) throw "Property " + key + " already exists."; //only throw error if non truthy value set.
      defProp(key, props, target, onPropsChange);
    }
    for(const key of Object.getOwnPropertySymbols(props)){
      defProp(key, props, target, onPropsChange);
    }
  }
  const methods = source.methods;
  if (methods !== undefined) {
    for (const key in methods) {
      defMethod(key, methods, target, onPropsChange);
    }
    for(const key of Object.getOwnPropertySymbols(methods)){
      defProp(key, methods, target, onPropsChange);
    }
  }
  const events = source.on;
  if (events) {
    for (const key in events) {
      const handlerKey = key + "_transRenderHandler";  //TODO  : symbolize
      const prop = Object.defineProperty(target, handlerKey, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: events[key]
      });
      target.addEventListener(key, (<any>target)[handlerKey]);
    }
  }
}
