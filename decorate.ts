import { RenderContext, DecorateArgs, DecorateTuple, TransformValueOptions, AttribsSettings } from "./init.d.js";
import {domMerge} from './domMerge.js';

const evCount = Symbol('evtCount');
const handlerKey = Symbol('handlerKey');
/**
 * Turn number into string with even and odd values easy to query via css.
 * @param n 
 */
function to$(n: number) {
    const mod = n % 2;
    return (n - mod) / 2 + '-' + mod;
}
/**
 * Increment event count
 * @param name
 */
function incAttr(name: string, target: HTMLElement) {
    const ec = (<any>target)[evCount];
    if (name in ec) {
        ec[name]++;
    } else {
        ec[name] = 0;
    }
    target.setAttribute('data-' + name, to$(ec[name]));
}


function defProp(key: string | symbol, props: any, target: any, onPropsChange: symbol){
  const propVal = props[key];
  const keyS = key.toString();
  const localSym = Symbol(key.toString());
  Object.defineProperty(target, key, {
    get: function() {
      return this[localSym];
    },
    set: function(val) {
      const oldVal = this[localSym];
      if((oldVal === null || oldVal === undefined) && (val === oldVal)) return;
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
      incAttr(eventName, target);
      if(this[onPropsChange]) this[onPropsChange](key, val, oldVal);
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
export function decorate<PropsType = object, TAttribs = AttribsSettings> (
  target: HTMLElement,
  source: DecorateArgs<PropsType, TAttribs>
) {
  const onPropsChange = Symbol('onPropChange');

  domMerge(target, source);
  
  const props = source.propDefs;
  if (props !== undefined) {
    (<any>target)[evCount] = {};
    for (const key in props) {
      // throw error if non truthy value set?
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

