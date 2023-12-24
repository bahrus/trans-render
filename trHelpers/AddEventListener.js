export class AddEventListener {
    #abortController = new AbortController();
    constructor(mountObserver, transformer, uow, matchingElement, type, action, options) {
        let transpiledOptions = {
            signal: this.#abortController.signal,
        };
        switch (typeof options) {
            case 'boolean':
                transpiledOptions.capture = options;
                break;
            case 'object':
                Object.assign(transpiledOptions, options);
                break;
        }
        matchingElement.addEventListener(type, e => {
            action(e, transformer, uow);
        }, options);
        mountObserver.addEventListener('disconnect', e => {
            this.#abortController.abort();
        });
    }
}
