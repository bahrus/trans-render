import {UnitOfWork, EventListenerAction, ITransformer} from '../types';
import {MountObserver} from 'mount-observer/MountObserver.js';
export class AddEventListener<TProps, TMethods>{
    #abortController = new AbortController();
    constructor(
        mountObserver: MountObserver,
        transformer: ITransformer<TProps, TMethods>,
        uow: UnitOfWork<TProps, TMethods>,
        matchingElement: Element,
        type: string,
        action: EventListenerAction<TProps, TMethods>,
        options?: boolean | AddEventListenerOptions,
        
    ){
        let transpiledOptions: AddEventListenerOptions = {
            signal: this.#abortController.signal,
        }
        switch(typeof options){
            case 'boolean':
                transpiledOptions.capture = options;
                break;
            case 'object':
                Object.assign(transpiledOptions, options);
                break;
        }
        const transpiledAction = typeof action === 'string' ? transformer.model[action] : action;
        matchingElement.addEventListener(type, e => {
            (<any>transpiledAction)(e, transformer, uow);
        }, options);
        mountObserver.addEventListener('disconnect', e => {
            this.#abortController.abort();
        });
    }

    // onDisconnect(){
    //     this.#abortController.abort();
    // }
}