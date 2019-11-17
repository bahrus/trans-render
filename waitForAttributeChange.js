export function waitForAttributeChange(el, attributeName, test) {
    //kind of limited, promises only seem to support one time only events.  I guess this is what RxJS is trying to do
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(mutations => {
            // For the sake of...observation...let's output the mutation to console to see how this all works
            mutations.forEach(mutation => {
                if (mutation.attributeName === attributeName) {
                    if (test) {
                        if (test(el.getAttribute(attributeName))) {
                            observer.disconnect();
                            resolve();
                        }
                    }
                    else {
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
