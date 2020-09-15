export function insertAdjacentTemplate(template: HTMLTemplateElement, target: Element, position: InsertPosition, callback?: (clone: DocumentFragment) => void){
    const clone = document.importNode(template.content, true);
    if(callback !== undefined) callback(clone);
    let appendTarget = target;
    let isFirst = true;
    const appendedChildren : Element[] = [];
    Array.from(clone.children).forEach(child =>{
      const modifiedPosition : InsertPosition = isFirst ? position : 'afterend';
      isFirst = false;
      appendTarget = appendTarget.insertAdjacentElement(modifiedPosition, child)!;
      appendedChildren.push(appendTarget);
    })
    return appendedChildren;
}