export function insertAdjacentClone(clone: DocumentFragment, target: Element, position: InsertPosition){
    let appendTarget = target;
    let lastTextNode: Node | undefined;
    let prevAppendTarget: Element = appendTarget;
    let isFirst = true;
    const childNodes = Array.from(clone.childNodes);
    for(const child of childNodes){
      const modifiedPosition : InsertPosition = isFirst ? position : 'afterend';
      isFirst = false;
      //assume for now alternates between element nodes and non element nodes
      //surely there's a better way?
      
      if(child.nodeType === 1){
        appendTarget = appendTarget.insertAdjacentElement(modifiedPosition, child as Element)!;
        if(lastTextNode !== undefined){
          prevAppendTarget.insertAdjacentText('afterend', lastTextNode.textContent!);
          prevAppendTarget = appendTarget;
          lastTextNode = undefined;
        }
      }else{
         lastTextNode = child;
      }
    }
    
}