
interface Vals{
    attrs: {[key: string] : string | boolean | number} | undefined,
    propVals: Map<string | symbol, any>,
}
function assignSpecial<T extends HTMLElement>(target: T, vals: T, propNames: string[]) {
  propNames.forEach(propName => {
    const targetProp = (<any>target)[propName];
    const srcProp = (<any>vals)[propName];
    Object.assign(targetProp, srcProp);
    delete (<any>vals)[propName];
  });
}
function setAttribs(target: HTMLElement, source: Vals) {
  const attributes = source.attrs;
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
    //delete source[attrib];
  }
}

export function domAssign<T extends HTMLElement, U extends HTMLElement>(
  target: T,
  source: U
): T & U {
    return Object.assign(target, source);
}
