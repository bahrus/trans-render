import { RenderContext, DecorateArgs, TransformValueOptions } from "./init.d.js";

export const attribs = Symbol('attribs');

export interface HasAttribs<T extends HTMLElement>{
  [attribs]?: {[key: string] : string | boolean};
}

function assignSpecial<T extends HTMLElement>(
  target: T,
  vals: HasAttribs<T>,
  propNames: string[]
) {
  propNames.forEach(propName => {
    const targetProp = (<any>target)[propName];
    const srcProp = (<any>vals)[propName];
    Object.assign(targetProp, srcProp);
    delete (<any>vals)[propName];
  });
}
function setAttribs(target: HTMLElement, valCopy: any){
    const attributes = valCopy[attribs];
    if(attributes !== undefined){
        for(const key in attributes){
            const attrib = attributes[key];
            switch(typeof attrib){
                case 'string':
                  target.setAttribute(key, attrib);
                  break;
                case 'boolean':
                  if(attrib === true){
                      target.setAttribute(key, '');
                  }else{
                      target.removeAttribute(key);
                  }
            }
            if(attrib === true){
                target.setAttribute(key, '');
            }
        }
        delete valCopy[attribs];
    }
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
export function decorate<T extends HTMLElement>(
  target: T,
  vals: HasAttribs<T> | null,
  decor?: DecorateArgs
) {
  const onPropsChange = Symbol('onPropChange');
  if (vals !== null) {
    const valCopy = { ...vals };
    assignSpecial(target, valCopy, ["dataset", "style"]);
    setAttribs(target, valCopy);
    Object.assign(target, valCopy);
  }
  if (decor === undefined) return;
  // if(decor.id){
  //   if((<any>target)[decor.id] === true) return;
  //   (<any>target)[decor.id] = true;
  // }
  const props = decor.props;
  if (props !== undefined) {
    for (const key in props) {
      //if (props[key]) throw "Property " + key + " already exists."; //only throw error if non truthy value set.
      defProp(key, props, target, onPropsChange);
    }
    for(const key of Object.getOwnPropertySymbols(props)){
      defProp(key, props, target, onPropsChange);
    }
  }
  const methods = decor.methods;
  if (methods !== undefined) {
    for (const key in methods) {
      defMethod(key, methods, target, onPropsChange);
    }
    for(const key of Object.getOwnPropertySymbols(methods)){
      defProp(key, methods, target, onPropsChange);
    }
  }
  const events = decor.on;
  if (events) {
    for (const key in events) {
      const handlerKey = key + "_transRenderHandler";
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
