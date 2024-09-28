export function stdEvt(el: Element){
    const {localName} = el;
    switch(localName){
        case 'input':
            return localName;
        case 'form':
            return 'input';
        case 'slot':
            return 'slotchange';
        default:
            if(el.hasAttribute('contenteditable')){
                return 'input';
            }
            return 'click';
    }
}