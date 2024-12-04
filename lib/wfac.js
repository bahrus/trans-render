export function wfac(el, attributeNameOrNames, test) {
    //kind of limited, promises only seem to support one time only events. 
    const attrNames = Array.isArray(attributeNameOrNames) ? attributeNameOrNames : [attributeNameOrNames];
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
        };
        observer.observe(el, observerConfig);
    });
}
