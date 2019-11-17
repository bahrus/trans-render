export function waitForAttributeChange(el: HTMLElement, attributeName: string, once: boolean = true, test?: (s: string | null) => boolean){
    //does it even make sense to listen more than once with a promise?
    //observer of some sort?
    return new Promise((resolve, reject) =>{
        const observer = new MutationObserver(mutations => {
            // For the sake of...observation...let's output the mutation to console to see how this all works
            mutations.forEach(mutation => {
                if(mutation.attributeName === attributeName){
                    if(test){
                        if(test(el.getAttribute(attributeName))){
                            resolve();
                            if(once){
                                observer.disconnect();
                            }
                        }
                    }else{
                        resolve();
                    }
                }
            });    
        });
         
        // Notify me of everything!
        const observerConfig = {
            attributes: true, 
        };
         
        observer.observe(el, observerConfig);
    });

}