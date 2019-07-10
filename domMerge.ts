import {Vals} from './init.d.js';
import {mergeDeep} from './mergeDeep.js';
// function assignSpecial(
//   target: HTMLElement,
//   vals: object,
//   propNames: string[]
// ) {
//   propNames.forEach(propName => {
//     const targetProp = (<any>target)[propName];
//     const srcProp = (<any>vals)[propName];
//     Object.assign(targetProp, srcProp);
//     delete (<any>vals)[propName];
//   });
// }
function setAttribs(target: HTMLElement, source: Vals) {
  const attributes = source.attribs;
  if (attributes !== undefined) {
    for (const key in attributes) {
      const attrib = attributes[key];
      switch (typeof attrib) {
        case 'string':
          target.setAttribute(key, attrib as string); // why is casting needed?
          break;
        case "boolean":
          if (attrib === true) {
            target.setAttribute(key, "");
          } else {
            target.removeAttribute(key);
          }
          break;
        case "number":
          target.setAttribute(key, attrib!.toString());
          break;
        case null:
        case undefined:
          target.removeAttribute(key);
          break;
      }
    }
  }
}

export function domMerge(target: HTMLElement, vals: Vals): void {
  const propVals = vals.propVals
  if (propVals !== undefined) {
    //const valCopy = { ...propVals };
    //assignSpecial(target, valCopy, ["dataset", "style"]);
    //Object.assign(target, valCopy);
    //setAttribs(target, );
    mergeDeep(target, propVals);
  }
  if(vals.attribs !== undefined){
    setAttribs(target, vals);
  }
}
