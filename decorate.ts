import { RenderContext, DecorateArgs, TransformValueOptions } from "./init.d.js";

const spKey = "__transrender_deco_onPropsChange";

function assignSpecial<T extends HTMLElement>(
  target: T,
  vals: T,
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
    const attribs = valCopy.attribs;
    if(attribs !== undefined){
        for(const key in attribs){
            const attrib = attribs[key];
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
        delete valCopy.attribs;
    }
}
export function decorate<T extends HTMLElement>(
  target: T,
  vals: T | null,
  decor?: DecorateArgs
) {
  if (vals !== null) {
    const valCopy = { ...vals };
    assignSpecial(target, valCopy, ["dataset", "style"]);
    setAttribs(target, valCopy);
    Object.assign(target, valCopy);
    //classes?
  }
  if (decor === undefined) return;

  const props = decor.props;
  if (props !== undefined) {
    for (const key in props) {
      if (props[key]) throw "Property " + key + " already exists."; //only throw error if non truthy value set.
      const propVal = props[key];

      Object.defineProperty(target, key, {
        get: function() {
          return this["_" + key];
        },
        set: function(val) {
          this["_" + key] = val;
          const eventName = key + "-changed";
          const newEvent = new CustomEvent(eventName, {
            detail: {
              value: val
            },
            bubbles: true,
            composed: false
          } as CustomEventInit);
          this.dispatchEvent(newEvent);
          if (this[spKey]) this[spKey](key, val);
        },
        enumerable: true,
        configurable: true
      });
      (<any>target)[key] = propVal;
    }
  }
  const methods = decor.methods;
  if (methods !== undefined) {
    for (const key in methods) {
      const method = methods[key];
      const fnKey = key === "onPropsChange" ? spKey : key;
      Object.defineProperty(target, fnKey, {
        enumerable: false,
        configurable: true,
        writable: true,
        value: method
      });
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
