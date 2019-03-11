export function insertAdjacentTemplate(template: HTMLTemplateElement, target: Element, position: InsertPosition){
    const clone = document.importNode(template.content, true);
    let appendTarget = target;
    Array.from(clone.children).forEach(child =>{
      appendTarget = appendTarget.insertAdjacentElement(position, child)!;
    })
}