export function findAdjacentElement(insertPosition: InsertPosition, element: Element, selector: string){

    switch(insertPosition){
        case 'afterbegin':
        case 'beforeend':
            return element.querySelector(selector);
            break;
        case 'beforebegin':
            {
                let trigger = element.previousElementSibling;
                while(trigger !== null){
                    if(trigger.matches(selector)){
                        return trigger;
                    }
                    trigger = trigger.previousElementSibling;
                }
                return null;
            }
        case 'afterend':
            {
                let trigger = element.nextElementSibling;
                while(trigger !== null){
                    if(trigger.matches(selector)){
                        return trigger;
                    }
                    trigger = trigger.nextElementSibling;
                }
                return null;
            }
        }

}