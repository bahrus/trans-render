// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events#Mutation_Observers_alternatives_examples
//can't we use https://developer.mozilla.org/en-US/docs/Web/API/Node/contains#:~:text=The%20Node.,direct%20children%2C%20and%20so%20on.?
export function onRemove(element, callback) {
    let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.removedNodes.forEach(removed => {
                if (element === removed) {
                    callback();
                    observer.disconnect();
                }
            });
        });
    });
    observer.observe(element.parentElement || element.getRootNode(), {
        childList: true,
    });
}
;
