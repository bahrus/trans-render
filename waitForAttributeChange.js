export function waitForAttributeChange(el, attributeName, once = true, test) {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver(mutations => {
            // For the sake of...observation...let's output the mutation to console to see how this all works
            mutations.forEach(mutation => {
                if (mutation.attributeName === attributeName) {
                    if (test) {
                        if (test(el.getAttribute(attributeName))) {
                            resolve();
                            if (once) {
                                observer.disconnect();
                            }
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
