export function waitForAttributeChange(el: HTMLElement, attributeName: string, test?: (s: string | null) => boolean){
    //kind of limited, promises only seem to support one time only events.  I guess this is what RxJS is trying to do
    return new Promise((resolve, reject) =>{
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if(mutation.attributeName === attributeName){
                    if(test){
                        if(test(el.getAttribute(attributeName))){
                            observer.disconnect();
                            resolve(mutation);
                        }
                    }else{
                        observer.disconnect();
                        resolve(mutation);
                    }
                }
            });    
        });
        const observerConfig = {
            attributes: true, 
        };
        observer.observe(el, observerConfig);
    });

}