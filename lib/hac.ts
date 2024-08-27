export function hac(
    el: Element, attributeName: string,
    handler: EventListenerObject, 
    test?: (s: string | null) => boolean
){

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if(mutation.attributeName === attributeName){
                if(test){
                    if(test(el.getAttribute(attributeName))){
                        handler.handleEvent(new Event('attrChange'));
                    }
                }else{
                    handler.handleEvent(new Event('attrChange'));
                }
            }
        });    
    });
    const observerConfig = {
        attributes: true, 
    };
    observer.observe(el, observerConfig);


}