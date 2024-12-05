import { arr } from './arr.js';
//abbrev for wait for attribute change
export function wfac(el, attributeNameOrNames, test) {
    //kind of limited, promises only seem to support one time only events. 
    const attrNames = arr(attributeNameOrNames);
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                const { attributeName } = mutation;
                if (attributeName === null)
                    return;
                if (attrNames.includes(attributeName)) {
                    if (test) {
                        if (test(mutation, el, attributeNameOrNames)) {
                            observer.disconnect();
                            resolve(mutation);
                        }
                    }
                    else {
                        observer.disconnect();
                        resolve(mutation);
                    }
                }
            });
        });
        const observerConfig = {
            attributes: true,
            attributeFilter: attrNames,
        };
        observer.observe(el, observerConfig);
    });
}
