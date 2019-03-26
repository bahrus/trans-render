import {Vals} from './init.d.js';
function assignSpecial<T extends HTMLElement>(
  target: T,
  vals: object,
  propNames: string[]
) {
  propNames.forEach(propName => {
    const targetProp = (<any>target)[propName];
    const srcProp = (<any>vals)[propName];
    Object.assign(targetProp, srcProp);
    delete (<any>vals)[propName];
  });
}
function setAttribs(target: HTMLElement, source: Vals) {
  const attributes = source.attribs;
  if (attributes !== undefined) {
    for (const key in attributes) {
      const attrib = attributes[key];
      switch (typeof attrib) {
        case "string":
          target.setAttribute(key, attrib);
          break;
        case "boolean":
          if (attrib === true) {
            target.setAttribute(key, "");
          } else {
            target.removeAttribute(key);
          }
      }
      if (attrib === true) {
        target.setAttribute(key, "");
      }
    }
  }
}

export function domAssign<T extends HTMLElement>(target: T, vals: Vals): void {
  const propVals = vals.propVals
  if (propVals !== undefined) {
    const valCopy = { ...propVals };
    assignSpecial(target, valCopy, ["dataset", "style"]);
    Object.assign(target, valCopy);
    setAttribs(target, valCopy);
    
  }
  if(vals.attribs !== undefined){
    setAttribs(target, vals);
  }
}
