export function insertAdjacentClone(clone: DocumentFragment, target: Element, position: InsertPosition){
    let appendTarget = target;
    let isFirst = true;
    Array.from(clone.children).forEach(child =>{
      const modifiedPosition : InsertPosition = isFirst ? position : 'afterend';
      isFirst = false;
      appendTarget = appendTarget.insertAdjacentElement(modifiedPosition, child)!;
    });
}